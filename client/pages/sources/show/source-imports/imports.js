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

  const sourceId = FlowRouter.getParam('_id');
  if (sourceId) {
    subsManager.subscribe('sourceImports.private', sourceId);
  }

  window.SourceImports = SourceImports; // FIXME: we don't need that only for debugging
});


Template.sources_show_header.helpers({
  source() {
    return Sources.findOne(FlowRouter.getParam('_id'));
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
  sourceImport() {
    const selectedImport = SourceImports.findOne(FlowRouter.getParam('importId'));
    if (selectedImport) {
      return selectedImport;
    }
    return SourceImports.findOne({ sourceId: FlowRouter.getParam('_id') }, { sort: { startTimestamp: -1 }});
  },
});
