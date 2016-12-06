import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Organizations } from '/both/api/organizations/organizations.js';
import { Apps } from '/both/api/apps/apps.js';
import { AutoForm } from 'meteor/aldeed:autoform';
import subsManager from '/client/lib/subs-manager';

Template.apps_create_page.onCreated(() => {
  window.Organizations = Organizations;
  window.Apps = Apps;

  subsManager.subscribe('apps.public');
  subsManager.subscribe('organizations.public');
});

Template.apps_create_page.helpers({
  organization() {
    const orga = Organizations.findOne({ _id: FlowRouter.getParam('_id') });
    return orga;
  },
});

AutoForm.addHooks('insertAppForm', {
  onSuccess(formType, _id) {
    FlowRouter.go('apps.show', { _id });

    this.event.preventDefault();
    return false;
  },
});
