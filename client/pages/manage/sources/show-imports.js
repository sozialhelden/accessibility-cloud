import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Sources } from '/both/api/sources/sources.js';
import { SourceImports } from '/both/api/source-imports/source-imports.js';
import { PlaceInfos } from '/both/api/place-infos/place-infos.js';


import subsManager from '/client/lib/subs-manager';

Template.sources_show_imports_page.onCreated(() => {
  subsManager.subscribe('organizations.public');
  subsManager.subscribe('sources.public');
  subsManager.subscribe('sourceImports.public');

  const importId = FlowRouter.getParam('importId');
  if (importId) {
    subsManager.subscribe('placeInfosFromImport.public', importId);
  }
  window.SourceImports = SourceImports;	// FIXME: we don't need that only for debugging
});


Template.sources_show_header.helpers({
  source() {
    return Sources.findOne(FlowRouter.getParam('_id'));
  },
});

Template.sources_show_imports_page.events({
  'click .btn.js-start-import'(event) {
    event.preventDefault();

    Meteor.call('sources.startImport', FlowRouter.getParam('_id'), (err, result) => {
      if (err) {
        console.log(err);
      } else {
        FlowRouter.go('manage.sources.show.imports', {
          _id: FlowRouter.getParam('_id'),
          importId: result,
        });
      }
    });
  },
});

function getCurrentSource() {
  return Sources.findOne(FlowRouter.getParam('_id'));
}

Template.sources_show_imports_page.helpers({
  source: getCurrentSource,
  isImportButtonEnabled() {
    const source = getCurrentSource();
    return source && source.canBeImported();
  },
  activeIfCurrentImport(sourceId) {
    return FlowRouter.getParam('importId') === sourceId ? 'active' : '';
  },
  sourceImports() {
    const selector = { sourceId: FlowRouter.getParam('_id') };
    const options = { sort: { startTimestamp: -1 } };
    return SourceImports.find(selector, options);
  },
  placesUpdatedCount() {
    const sourceImportId = FlowRouter.getParam('importId');

    return PlaceInfos.find({ 'properties.sourceImportId': sourceImportId }).count();
  },
  examplePlaceInfos() {
    const sourceImportId = FlowRouter.getParam('importId');
    return PlaceInfos.find({ 'properties.sourceImportId': sourceImportId }, { limit: 3 });
  },
  sourceImport() {
    const selectedImport = SourceImports.findOne(FlowRouter.getParam('importId'));
    if (selectedImport) {
      return selectedImport;
    }
    return SourceImports.findOne({ sourceId: FlowRouter.getParam('_id') });
  },
});
