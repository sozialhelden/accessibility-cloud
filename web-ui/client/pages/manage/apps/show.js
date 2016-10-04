import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Apps } from '/both/api/apps/apps.js';
import { Organizations } from '/both/api/organizations/organizations.js';
import subsManager from '/client/lib/subs-manager';

Template.apps_show_page.onCreated(function created() {
  subsManager.subscribe('apps.public');
  subsManager.subscribe('organizations.public');
  subsManager.subscribe('sources.public');
});


Template.apps_show_page.helpers({
  app() {
    const orga = Apps.findOne({ _id: FlowRouter.getParam('_id') });
    return orga;
  },
  organizations() {
    const orgCursor = Apps.find({});
    return orgCursor;
  },
});
