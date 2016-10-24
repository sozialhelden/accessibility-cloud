import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Sources } from '/both/api/sources/sources.js';
import { SourceImports } from '/both/api/source-imports/source-imports.js';
import { PlaceInfos } from '/both/api/place-infos/place-infos.js';
import { acFormat } from '/both/lib/ac-format.js';
import { $ } from 'meteor/jquery';

import { _ } from 'meteor/stevezhu:lodash';

import subsManager from '/client/lib/subs-manager';


Template.sources_show_format_page.onCreated(() => {
  subsManager.subscribe('organizations.withContent.mine');
  subsManager.subscribe('sourceImports.public');

  window.SourceImports = SourceImports;
  window.Sources = Sources;
});

const helpers = {
  source() {
    return Sources.findOne({ _id: FlowRouter.getParam('_id') });
  },
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
  placesUpdatedCount() {
    const sourceImportId = FlowRouter.getParam('importId');

    return PlaceInfos.find({ sourceImportId }).count();
  },
  examplePlaceInfos() {
    const sourceId = FlowRouter.getParam('_id');
    const latestImport = SourceImports.findOne({ sourceId }, { sort: { startTimestamp: -1 } });
    if (latestImport) {
      return PlaceInfos.find({ sourceImportId: latestImport._id }, { limit: 3 });
    }
    return null;
  },
};

Template.sources_show_format_page.helpers(helpers);
Template.sources_show_format_page.events({
  'click button.js-save': function saveButtonClicked(event) {
    event.preventDefault();

    const _id = FlowRouter.getParam('_id');
    const newStreamChainText = $('textarea#streamChain')[0].value;
    const newStreamChain = JSON.parse(newStreamChainText);

    Sources.update(_id, {
      $set: { streamChain: newStreamChain },
    });
  },
  'click .btn.js-start-import'(event) {
    event.preventDefault();

    Meteor.call('sources.startImport', FlowRouter.getParam('_id'), (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log('import finished', result);
      }
    });
  },
  'input textarea#streamChain'(event) {
    let chain = undefined;
    try {
      const chainText = $('textarea#streamChain')[0].value;
      chain = JSON.parse(chainText);
    } catch (e) {
      $('.errors').html('Invalid json format');
      return;
    }
    for (let i = 0; i < chain.length; i++) {
      const chainPart = chain[i];
      if (chainPart.type !== 'TransformData') {
        continue;
      }
      // console.log(chain[i]);
      const mappings = chainPart.parameters.mappings;
      if (mappings === undefined) {
        $('.errors').html('No mappings defined');
        return;
      }
      let missingPaths = [];

      _.each(mappings, function (obj, key) {
        const path = key.replace(/-/g, '.');

        if (_.get(acFormat, path) === undefined) {
          missingPaths.push(path);
        }
      });
      if (missingPaths.length) {
        $('.errors').html('Invalid mapping paths:<ul><li>' + missingPaths.join('</li><li>') + '</li></ul> <a href="https://github.com/sozialhelden/ac-machine/blob/master/docs/ac-format.md">Please see documentation</a>' );
      } else {
        $('.errors').html('');
      }
    }
  },
});
