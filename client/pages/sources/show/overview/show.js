import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Sources } from '/both/api/sources/sources.js';
import { SourceImports } from '/both/api/source-imports/source-imports.js';
import subsManager from '/client/lib/subs-manager';
import { getCurrentFeature } from './get-current-feature';

function defaultPlaceCountLimit() {
  return 5000;
}

function serverSideDocumentCountLimit() {
  return 150000;
}

function source() {
  return Sources.findOne({ _id: FlowRouter.getParam('_id') });
}

function currentDocumentCountLimit() {
  return FlowRouter.getQueryParam('limit') || defaultPlaceCountLimit();
}

function shouldShowThisCanTakeAWhileHint() {
  return currentDocumentCountLimit() > 50000;
}

function isShowingAllPlaces() {
  const currentSource = source();
  if (!currentSource) { return true; }
  return currentDocumentCountLimit() >= currentSource.documentCount;
}

function canShowMorePlaces() {
  const currentSource = source();
  if (!currentSource) { return false; }
  return currentDocumentCountLimit() < serverSideDocumentCountLimit() &&
    currentSource.documentCount > currentDocumentCountLimit();
}

function couldShowAllPlaces() {
  const currentSource = source();
  if (!currentSource) { return false; }
  return serverSideDocumentCountLimit() > currentSource.documentCount;
}

function sourceImports() {
  return SourceImports.find({ sourceId: FlowRouter.getParam('_id') });
}

function sourceImport() {
  const selectedImport = SourceImports.findOne({ sourceId: FlowRouter.getParam('importId') });

  if (selectedImport) {
    return selectedImport;
  }
  return SourceImports.findOne({ sourceId: FlowRouter.getParam('_id') });
}

function hasBigSidebar() {
  FlowRouter.watchPathChange();
  return Boolean(FlowRouter.getParam('placeInfoId') || FlowRouter.getParam('equipmentInfoId') || FlowRouter.getParam('disruptionId'));
}

Template.sources_show_page.onCreated(function created() {
  subsManager.subscribe('sourceImports.public');
  subsManager.subscribe('sourceImports.private');
  subsManager.subscribe('sources.public');
  subsManager.subscribe('organizations.public');
  subsManager.subscribe('organizationMembers.public');
  subsManager.subscribe('organizationMembers.private');
  subsManager.subscribe('licenses.public');
  this.autorun(() => {
    if (FlowRouter.getParam('placeInfoId')) {
      subsManager.subscribe('placeInfos.single', FlowRouter.getParam('placeInfoId'));
    }
    if (FlowRouter.getParam('equipmentInfoId')) {
      subsManager.subscribe('equipmentInfos.single', FlowRouter.getParam('equipmentInfoId'));
    }
    if (FlowRouter.getParam('disruptionId')) {
      subsManager.subscribe('disruptions.single', FlowRouter.getParam('disruptionId'));
    }
  });
  window.SourceImports = SourceImports; // FIXME: we don't need that, only for debugging
});

const helpers = {
  source,
  couldShowAllPlaces,
  isShowingAllPlaces,
  defaultPlaceCountLimit,
  currentDocumentCountLimit,
  shouldShowThisCanTakeAWhileHint,
  canShowMorePlaces,
  serverSideDocumentCountLimit,
  sourceImports,
  sourceImport,
  getCurrentFeature,
  hasBigSidebar,
};

Template.sources_show_header.helpers(helpers);
Template.sources_show_page.helpers(helpers);
Template.sources_show_page_map.helpers(helpers);
Template.sources_show_page_attributes.helpers(helpers);
Template.sources_show_page_sidebar.helpers(helpers);
Template.sources_show_page_place_info.helpers(helpers);
Template.sources_show_page_source_info.helpers(helpers);
Template.sources_show_page_source_top_stats.helpers(helpers);

Template.sources_show_page_place_info.events({
  'click .js-close'(event) {
    FlowRouter.go('sources.show', {
      _id: FlowRouter.getParam('_id'),
    }, {
      limit: FlowRouter.getQueryParam('limit'),
    });
    event.preventDefault();
  },
});

Template.sources_show_page_source_info.events({
  'click .js-show-all-places'(event) {
    FlowRouter.withReplaceState(() =>
      FlowRouter.setQueryParams({ limit: 150000 })
    );
    event.preventDefault();
  },
});
