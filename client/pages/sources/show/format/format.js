import includes from 'lodash/includes';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Sources } from '/both/api/sources/sources.js';
import { SourceImports } from '/both/api/source-imports/source-imports.js';
import { ImportFlows } from '/both/api/import-flows/import-flows.js';
import { acFormat } from '/both/lib/ac-format.js';
import { $ } from 'meteor/jquery';

import _ from 'lodash';

import subsManager from '/client/lib/subs-manager';
import * as importFlowTemplates from '/client/lib/import-flow-templates';
import { isAdmin } from '/both/lib/is-admin';

const TAB_KEY_CODE = 9;

Template.sources_show_format_page.onCreated(() => {
  subsManager.subscribe('organizations.public');
  subsManager.subscribe('licenses.public');
  subsManager.subscribe('sources.public');
  subsManager.subscribe('sources.private');
  subsManager.subscribe('organizationMembers.public');
  subsManager.subscribe('organizationMembers.private');
  const sourceId = FlowRouter.getParam('_id');
  if (sourceId) {
    subsManager.subscribe('sourceImports.public', sourceId);
    subsManager.subscribe('sourceImports.private', sourceId);
    subsManager.subscribe('importFlows.forSource', sourceId);
  }
  window.SourceImports = SourceImports;
  window.Sources = Sources;
});


function getSource() {
  return Sources.findOne({ _id: FlowRouter.getParam('_id') });
}

const helpers = {
  source: getSource,
  importFlowTemplates,
  isAdmin() {
    return isAdmin(Meteor.userId());
  },
  subscriptionsReady() {
    return subsManager.ready();
  },
  sourceImports() {
    return SourceImports.find({ sourceId: FlowRouter.getParam('_id') });
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

        const currentImportFlow = helpers.currentImportFlow();
        const firstStream = currentImportFlow.getFirstStream();

        if (!firstStream || firstStream.type !== 'HTTPDownload') {
          return showError(
            'Please setup the source format first so it has a HTTP download stream.'
          );
        }

        const importFlowId = currentImportFlow._id;

        Meteor.call(
          'updateDataURLForImportFlow',
          importFlowId,
          response.uploadedFile.storageUrl,
          (error) => {
            if (error) {
              showError(error.message || error.reason);
              return;
            }
            Meteor.call('sources.startImport', importFlowId);
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
  getNotificationsForImportFlow() {
    const notifications = [];
    const source = getSource();

    if (!source) {
      return [];
    }

    const currentImportFlow = helpers.currentImportFlow();

    if (!currentImportFlow) {
      return [];
    }

    const hasDownloadStep = currentImportFlow.hasDownloadStep();

    if (hasDownloadStep) {
      if (source.isDraft) {
        notifications.push(`
          Your data will only be visible to members of ${source.getOrganization().name}
          as your source is set to draft mode.
        `);
      }
    } else {
      notifications.push(`
        Your source import flow is still missing a <code>HTTPDownload</code> step.
        Please add it to enable importing your data.
      `);
    }

    return notifications;
  },
  currentImportFlow() {
    // urls are 1-indexed, arrays are 0-indexed
    const index = Number(FlowRouter.getParam('import_flow_index')) - 1;

    return ImportFlows.findOne({
      sourceId: FlowRouter.getParam('_id'),
    }, {
      sort: {
        createdAt: 1,
      },
      skip: index,
    });
  },
  currentImportFlowHasStreams() {
    const importFlow = helpers.currentImportFlow();
    return importFlow && importFlow.hasStreams();
  },
  isCurrentImportFlow(id) {
    return helpers.currentImportFlow()._id === id;
  },
  getClassNameForImportFlowListItem(id) {
    return {
      'class': helpers.isCurrentImportFlow(id) ? 'current-import-flow-tab' : '',
    };
  },
  getImportFlows() {
    return getSource().getImportFlows().map((doc, i) => Object.assign({}, doc, {
      urlIndex: i + 1,
    }));
  },
};

function parseImportFlowDefinition(instance) {
  const newImportFlowText = instance.$('textarea#importFlow')[0].value;
  let newImportFlow = null;
  try {
    newImportFlow = JSON.parse(newImportFlowText);
  } catch (error) {
    $('.import-flow-errors').html(`<strong>Invalid JSON:</strong> ${error.message}`);
    $('.import-flow-errors').removeClass('is-empty');
  }
  return newImportFlow;
}

function addError(errorHTML) {
  $('.import-flow-errors').append(`<li>${errorHTML}</li>`);
  $('.import-flow-errors').removeClass('is-empty');
}

Template.sources_show_format_page.helpers(helpers);
Template.sources_show_format_schedule_button.helpers(helpers);

Template.sources_show_format_page.events({
  'dblclick .current-import-flow-tab'(event) {
    event.stopPropagation();
    event.preventDefault();
    const name = window.prompt(`Enter a new name for the ‘${this.name}’ import flow:`, this.name);
    if (!name) return;
    ImportFlows.update(this._id, { $set: { name } });
  },
  'click .btn.js-set-format'(event) {
    event.preventDefault();
    const templateName = Template.instance().find('input:checked').value;
    const streamChain = importFlowTemplates[templateName].streamChain;
    if (!streamChain) {
      throw new Error(`${templateName} template has no valid stream chain`);
    }

    const currentImportFlow = helpers.currentImportFlow();

    if (currentImportFlow) {
      ImportFlows.update(currentImportFlow._id, {
        $set: {
          streams: streamChain,
        },
      });
    } else {
      const source = getSource();
      source.addImportFlow({
        streams: streamChain,
      });
    }
  },
  'click .add-import-flow, dblclick .source-import-flows-tabs'(event) {
    event.stopPropagation();
    event.preventDefault();
    const source = getSource();
    const importFlowsCount = source.getImportFlows().count();
    const newFlowIndex = importFlowsCount + 1;
    const newImportFlowName = `Flow_${newFlowIndex}`;

    ImportFlows.insert({
      sourceId: source._id,
      name: newImportFlowName,
      createdAt: Date.now(),
    });

    const newFlowPath = FlowRouter.path('sources.show.format.for_import_flow', {
      _id: FlowRouter.getParam('_id'),
      import_flow_index: newFlowIndex,
    });
    FlowRouter.go(newFlowPath);
  },
  'click .delete-import-flow-icon'() {
    const message = 'Are you sure you want to delete this import flow?';
    const shouldBeDeleted = confirm(message);

    if (shouldBeDeleted) {
      ImportFlows.remove(this._id);

      const source = getSource();
      const importFlowsCount = source.getImportFlows().count();
      const indexOfNewlyDisplayedImportFlow = Math.max(importFlowsCount, 1);

      const newFlowPath = FlowRouter.path('sources.show.format.for_import_flow', {
        _id: FlowRouter.getParam('_id'),
        import_flow_index: indexOfNewlyDisplayedImportFlow,
      });
      FlowRouter.go(newFlowPath);
    }
  },
  'click .js-start-import'(event) {
    const importFlowId = helpers.currentImportFlow()._id;
    event.preventDefault();

    Meteor.call('sources.startImport', importFlowId, error => {
      if (error) {
        alert(`Could not start import flow: ${error.reason}`);
      } else {
        console.log('Import started');
      }
    });
  },
  'click .js-abort-import'(event) {
    event.preventDefault();
    const sourceId = getSource()._id;

    Meteor.call('sources.abortImport', sourceId, (err) => {
      if (err) {
        console.log(err);
        alert(err);
      }
    });
  },
  'blur textarea#importFlow'(event, templateInstance) {
    const newImportFlow = parseImportFlowDefinition(templateInstance);
    if (!newImportFlow) {
      return;
    }
    const currentImportFlow = helpers.currentImportFlow();

    ImportFlows.update(currentImportFlow._id, {
      $set: {
        streams: newImportFlow,
      },
    }, (error) => {
      if (error) {
        addError(`<strong>Invalid import flow:</strong> ${error.message}`);
      }
    });
  },
  'keydown textarea#importFlow'(event) {
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
  'input textarea#importFlow'(event, templateInstance) {
    $('.import-flow-errors').html('').addClass('is-empty');

    const newImportFlow = parseImportFlowDefinition(templateInstance);
    if (!newImportFlow) {
      if ($(event.target).val() === '') {
        const currentImportFlow = helpers.currentImportFlow();

        ImportFlows.update({
          _id: currentImportFlow._id,
        }, {
          $unset: {
            streams: true,
          },
        });
      }
      return;
    }

    // TODO: Refactor this, put this logic into the model validation
    let chain = undefined;
    try {
      const chainText = $('textarea#importFlow')[0].value;
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
      if (!chainPart.parameters) {
        continue;
      }

      if (includes(['equipment', 'disruption'], chainPart.parameters.outputType)) {
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
          if (!missingPaths.match(/^properties.customData/)) {
            missingPaths.push(path);
          }
        }
      });

      if (missingPaths.length) {
        addError(`Invalid mapping paths:<ul><li>${missingPaths.join('</li><li>')}</li> — <a href="https://github.com/sozialhelden/accessibility-cloud/blob/master/docs/exchange-format.md#a-complete-sample-object">see format documentation</a></ul>`);
      }
    }
  },
});
