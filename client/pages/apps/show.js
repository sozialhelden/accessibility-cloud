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
  rootUrl() {
    return Meteor.absoluteUrl('');
  },
};

Template.apps_show_page.helpers(helpers);
Template.apps_show_header.helpers(helpers);

Template.apps_show_page.events({
  'click .js-delete'() {
    if (!confirm('Do you really want to delete this source and all of its imported places?')) {
      return;
    }
    const appId = FlowRouter.getParam('_id');
    Meteor.call('deleteAppWithId', appId, (error) => {
      if (error) {
        alert('Could not delete API client:', error.message);
      }
      FlowRouter.go('dashboard');
    });
  },


});

