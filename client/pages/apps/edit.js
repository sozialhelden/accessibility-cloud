import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { AutoForm } from 'meteor/aldeed:autoform';

import { Apps } from '/both/api/apps/apps.js';

import subsManager from '/client/lib/subs-manager';

SimpleSchema.debug = true;

Template.apps_edit_page.onCreated(() => {
  window.Apps = Apps;

  subsManager.subscribe('apps.public');
});

Template.apps_edit_page.helpers({
  app() {
    return Apps.findOne({ _id: FlowRouter.getParam('_id') });
  },
});

AutoForm.addHooks('updateAppForm', {
  onSuccess() {
    FlowRouter.go('apps.show', { _id: this.docId });

    this.event.preventDefault();
    return false;
  },
});