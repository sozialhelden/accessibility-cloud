import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Sources } from '/both/api/sources/sources.js';
import { SourceImports } from '/both/api/source-imports/source-imports.js';
import subsManager from '/client/lib/subs-manager';
import { getCurrentPlaceInfo } from './get-current-place-info';


Template.sources_show_page.onCreated(function created() {
  subsManager.subscribe('sourceImports.public');
  subsManager.subscribe('sources.public');
  subsManager.subscribe('organizations.public');
  subsManager.subscribe('licenses.public');
  this.autorun(() => {
    if (FlowRouter.getParam('placeInfoId')) {
      subsManager.subscribe('placeInfos.single', FlowRouter.getParam('placeInfoId'));
    }
  });
  window.SourceImports = SourceImports; // FIXME: we don't need that, only for debugging
});

Template.sources_show_page.onRendered(() => {
  subsManager.subscribe('sourcesPlaceInfoCounts', FlowRouter.getParam('_id'));
});

const helpers = {
  source() {
    return Sources.findOne({ _id: FlowRouter.getParam('_id') });
  },
  sourceImports() {
    return SourceImports.find({ sourceId: FlowRouter.getParam('_id') });
  },
  sourceImport() {
    const selectedImport = SourceImports.findOne({ sourceId: FlowRouter.getParam('importId') });

    if (selectedImport) {
      return selectedImport;
    }
    return SourceImports.findOne({ sourceId: FlowRouter.getParam('_id') });
  },
  getCurrentPlaceInfo,
  placeDetailsVisible() {
    FlowRouter.watchPathChange();
    return !!FlowRouter.getParam('placeInfoId');
  },
};

Template.sources_show_header.helpers(helpers);
Template.sources_show_page.helpers(helpers);
Template.sources_show_page_place_info.helpers(helpers);
Template.sources_show_page_source_info.helpers(helpers);

Template.sources_show_page_place_info.events({
  'click .js-close'(event) {
    FlowRouter.go('sources.show', {
      _id: FlowRouter.getParam('_id'),
    });
    event.preventDefault();
  },
  'click .js-show-all-places'(event) {

    event.preventDefault();
  },
});
