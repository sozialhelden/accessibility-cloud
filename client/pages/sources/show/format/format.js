import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Sources } from '/both/api/sources/sources.js';
import { SourceImports } from '/both/api/source-imports/source-imports.js';
import { acFormat } from '/both/lib/ac-format.js';
import { $ } from 'meteor/jquery';

import { _ } from 'meteor/stevezhu:lodash';

import subsManager from '/client/lib/subs-manager';
import * as importFlowTemplates from '/client/lib/import-flow-templates';

const TAB_KEY_CODE = 9;

Template.sources_show_format_page.onCreated(() => {
  subsManager.subscribe('organizations.public');
  subsManager.subscribe('sources.public');
  subsManager.subscribe('sources.private');
  subsManager.subscribe('sourceImports.public');
  subsManager.subscribe('sourceImports.private');

  window.SourceImports = SourceImports;
  window.Sources = Sources;
});

function getSource() {
  return Sources.findOne({ _id: FlowRouter.getParam('_id') });
}

const helpers = {
  source: getSource,
  importFlowTemplates,
  sourceImports() {
    return SourceImports.find({ sourceId: FlowRouter.getParam('_id') });
  },
  lastSourceImport() {
    const sourceId = FlowRouter.getParam('_id');
    const latestImport = SourceImports.findOne({ sourceId }, { sort: { startTimestamp: -1 } });
    if (latestImport) {
      return latestImport;
    }
    return null;
  },
  fileMetadata() {
    return {
      sourceId: FlowRouter.getParam('_id'),
    };
  },
  fileCallbacks() {
    function showError(message) {
      console.error(message);
      alert(`Error while uploading: ${message}`);
    }
    return {
      onError(error) {
        showError(error.message || error.reason);
      },
      onUploaded(response) {
        if (!response.uploadedFile) {
          return showError('Server did not send uploaded file information.');
        }

        const source = getSource();
        if (!source) {
          return showError(
            'Please wait until the source is loaded and retry.'
          );
        }

        const firstStream = source.streamChain && source.streamChain[0];
        if (!firstStream || firstStream.type !== 'HTTPDownload') {
          return showError(
            'Please setup the source format first so it has a HTTP download stream.'
          );
        }

        Meteor.call(
          'updateDataURLForSource',
          source._id,
          response.uploadedFile.storageUrl,
          (error) => {
            if (error) {
              showError(error.message || error.reason);
              return;
            }
            Meteor.call('sources.startImport', source._id);
          }
        );

        return true;
      },
    };
  },
  sourceImport() {
    const selectedImport = SourceImports.findOne(FlowRouter.getParam('importId'));
    if (selectedImport) {
      return selectedImport;
    }
    return SourceImports.findOne({ sourceId: FlowRouter.getParam('_id') });
  },
};

function parseStreamChainDefinition(instance) {
  const newStreamChainText = instance.$('textarea#streamChain')[0].value;
  let newStreamChain = null;
  try {
    newStreamChain = JSON.parse(newStreamChainText);
  } catch (error) {
    $('.errors').html(`<strong>Invalid JSON:</strong> ${error.message}`);
    $('.errors').removeClass('is-empty');
  }
  return newStreamChain;
}

function addError(errorHTML) {
  $('.errors').append(`<li>${errorHTML}</li>`);
  $('.errors').removeClass('is-empty');
}

Template.sources_show_format_page.helpers(helpers);
Template.sources_show_format_page.events({
  'click .btn.js-set-format'(event) {
    event.preventDefault();
    const templateName = Template.instance().find('input:checked').value;
    const streamChain = importFlowTemplates[templateName].streamChain;
    if (!streamChain) {
      throw new Error(`${templateName} template has no valid stream chain`);
    }
    Sources.update(this._id, { $set: { streamChain } });
  },
  'click .btn.js-start-import'(event) {
    event.preventDefault();

    Meteor.call('sources.startImport', FlowRouter.getParam('_id'), error => {
      if (error) {
        alert(`Could not start import: ${error.reason}`);
      } else {
        console.log('Import started');
      }
    });
  },
  'blur textarea#streamChain'(event, instance) {
    const newStreamChain = parseStreamChainDefinition(instance);
    if (!newStreamChain) {
      return;
    }
    const _id = FlowRouter.getParam('_id');
    Sources.update(_id, {
      $set: { streamChain: newStreamChain },
    }, (error) => {
      if (error) {
        addError(`<strong>Invalid stream chain:</strong> ${error.message}`);
      }
    });
  },
  'keydown textarea#streamChain'(event) {
    // Ensure tab key presses generate tabs instead of blurring the text area
    // idea borrowed from https://stackoverflow.com/a/6637396/387719
    const textArea = $(event.target);
    const keyCode = event.keyCode || event.which;
    if (keyCode === TAB_KEY_CODE && !event.shiftKey) {
      event.preventDefault();
      const start = textArea.get(0).selectionStart;
      const end = textArea.get(0).selectionEnd;

      // set textarea value to: text before caret + tab + text after caret
      textArea.val(`${textArea.val().substring(0, start)}\t${textArea.val().substring(end)}`);

      // put caret at right position again
      textArea.get(0).selectionStart = textArea.get(0).selectionEnd = start + 1;
    }
  },
  'input textarea#streamChain'(event, instance) {
    $('.errors').html('').addClass('is-empty');

    const newStreamChain = parseStreamChainDefinition(instance);
    if (!newStreamChain) {
      if ($(event.target).val() === '') {
        Sources.update(this._id, { $unset: { streamChain: 1 } });
      }
      return;
    }

    // TODO: Refactor this, put this logic into the model validation
    let chain = undefined;
    try {
      const chainText = $('textarea#streamChain')[0].value;
      chain = JSON.parse(chainText);
    } catch (e) {
      addError('Invalid json format');
      return;
    }
    for (let i = 0; i < chain.length; i++) {
      const chainPart = chain[i];
      if (chainPart.type !== 'TransformData') {
        continue;
      }
      if (chainPart.skipValidation) {
        continue;
      }
      // console.log(chain[i]);
      const mappings = chainPart.parameters.mappings;
      if (mappings === undefined) {
        addError('No mappings defined');
        return;
      }
      const missingPaths = [];

      _.each(mappings, (obj, key) => {
        const path = key.replace(/-/g, '.');

        if (_.get(acFormat, path) === undefined) {
          missingPaths.push(path);
        }
      });

      if (missingPaths.length) {
        addError(`Invalid mapping paths:<ul><li>${missingPaths.join('</li><li>')}</li> — <a href="https://github.com/sozialhelden/accessibility-cloud/blob/master/docs/exchange-format.md#a-complete-sample-object">see format documentation</a></ul>`);
      }
    }
  },
});
