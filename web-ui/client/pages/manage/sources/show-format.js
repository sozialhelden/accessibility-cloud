import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Sources } from '/both/api/sources/sources.js';
import { SourceImports } from '/both/api/source-imports/source-imports.js';
import { PlaceInfos } from '/both/api/place-infos/place-infos.js';

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
    const latestImport = SourceImports.findOne({ sourceId }, { sort: { DateTime: -1 } });
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
    const latestImport = SourceImports.findOne({ sourceId }, { sort: { DateTime: -1 } });
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
});
