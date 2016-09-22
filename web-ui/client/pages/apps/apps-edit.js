import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Apps } from '/both/api/apps/apps.js';

import { _ } from 'meteor/underscore';

Template.apps_edit_page.onCreated(function created() {
  window.Apps = Apps;

  this.autorun(() => {
    this.subscribe('sources.public');
    this.subscribe('apps.public');
  });
});

Template.apps_edit_page.helpers({
  app() {
    return Apps.findOne({ _id: FlowRouter.getParam('_id') });
  },
});
