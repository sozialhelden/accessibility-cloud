import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { AutoForm } from 'meteor/aldeed:autoform';

import { Apps } from '/both/api/apps/apps.js';

import subsManager from '/client/lib/subs-manager';

Template.apps_edit_page.onCreated(() => {
  window.Apps = Apps;

  subsManager.subscribe('apps.public');
});

Template.apps_edit_page.helpers({
  app() {
    return Apps.findOne({ _id: FlowRouter.getParam('_id') });
  },
});

Template.apps_edit_page.events({
  'click .js-set-app-hostname'(event, templateInstance) {
    const input = templateInstance.find('.js-app-hostname');
    const hostname = input.value.toLowerCase();
    event.preventDefault();
    if (!hostname) {
      alert('Please set an app hostname first.');
      return;
    }

    const _id = FlowRouter.getParam('_id');

    Meteor.call('setAccessibilityAppHostname', _id, hostname, (error) => {
      if (error) {
        alert(`Could not set hostname: ${error}`);
        return;
      }
      FlowRouter.go(`/apps/${hostname}/edit`);
    });
  },
  'click .js-sync-app-translations'(event) {
    Meteor.call('Apps.syncWithTransifex');
    Meteor.call('AppLinks.syncWithTransifex');
    event.preventDefault();
  },
});

AutoForm.addHooks('updateAppForm', {
  onSuccess() {
    FlowRouter.go('apps.show', { _id: this.docId });

    this.event.preventDefault();
    return false;
  },
});