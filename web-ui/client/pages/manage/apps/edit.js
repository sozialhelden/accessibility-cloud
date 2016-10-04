import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Apps } from '/both/api/apps/apps.js';

import { _ } from 'meteor/underscore';
import subsManager from '/client/lib/subs-manager';

Template.apps_edit_page.onCreated(function created() {
  window.Apps = Apps;

  subsManager.subscribe('apps.public');
});

Template.apps_edit_page.helpers({
  app() {
    return Apps.findOne({ _id: FlowRouter.getParam('_id') });
  },
});
