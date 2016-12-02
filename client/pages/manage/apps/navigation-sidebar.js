import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Apps } from '/both/api/apps/apps.js';
import { Organizations } from '/both/api/organizations/organizations.js';
import subsManager from '/client/lib/subs-manager';

// FIXME: not all required here
Template.apps_navigation_sidebar.onCreated(function created() {
  subsManager.subscribe('apps.public');
  subsManager.subscribe('organizations.public');
  subsManager.subscribe('sources.public');
});

function getOrganizationForView () {
  if (FlowRouter._current.route.name === 'organizations.show.apps') {
    const organizationId = FlowRouter.getParam('_id');
    return Organizations.findOne({ _id: organizationId });
  }

  const appId = FlowRouter.getParam('_id');
  const app = Apps.findOne({ _id: appId });
  if (app) {
    return Organizations.findOne({ _id: app.organizationId });
  }
  return {};
}

Template.apps_navigation_sidebar.helpers({
  apps() {
    const orga = getOrganizationForView();
    if (orga) {
      return Apps.find({ organizationId: orga._id });
    }
    return [];
  },
  organization() {
    return getOrganizationForView();
  },
  activeIfCurrentApp(_id) {
    return _id === FlowRouter.getParam('_id') ? 'active' : '';
  },
});
