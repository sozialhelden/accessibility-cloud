import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Apps } from '/both/api/apps/apps.js';
import { Organizations } from '/both/api/organizations/organizations.js';
import subsManager from '/client/lib/subs-manager';

Template.apps_show_page.onCreated(() => {
  subsManager.subscribe('apps.public');
  subsManager.subscribe('apps.private');
  subsManager.subscribe('organizations.public');
  subsManager.subscribe('sources.public');
});

const helpers = {
  organization() {
    const app = Apps.findOne({ _id: FlowRouter.getParam('_id') });
    return Organizations.findOne({ _id: app.organizationId });
  },
  app() {
    const app = Apps.findOne({ _id: FlowRouter.getParam('_id') });
    return app;
  },
  organizations() {
    const orgCursor = Apps.find({});
    return orgCursor;
  },
  rootUrl() {
    return Meteor.absoluteUrl('');
  },
};

Template.apps_show_page.helpers(helpers);
Template.apps_show_header.helpers(helpers);
