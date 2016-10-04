import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Organizations } from '/both/api/organizations/organizations.js';
import { Apps } from '/both/api/apps/apps.js';
import { AutoForm } from 'meteor/aldeed:autoform';

Template.apps_create_page.onCreated(function created() {
  window.Organizations = Organizations;
  window.Apps = Apps;

  this.autorun(() => {
    this.subscribe('apps.public');
    this.subscribe('organizations.public');
  });
});


Template.apps_create_page.helpers({
  organization() {
    const orga = Organizations.findOne({ _id: FlowRouter.getParam('_id') });
    return orga;
  },
});

AutoForm.addHooks('insertAppForm', {
  onSuccess(formType, _id) {
    FlowRouter.go('manage.apps.show', { _id });

    this.event.preventDefault();
    return false;
  },
});
