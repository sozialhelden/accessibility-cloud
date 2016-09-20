import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Organizations } from '/both/api/organizations/organizations.js';
import { AutoForm } from 'meteor/aldeed:autoform';

Template.organizations_create_page.onCreated(function created() {
  window.Organizations = Organizations;

  this.autorun(() => {
    this.subscribe('organizations.public');
  });
});


Template.organizations_create_page.helpers({
  organizationsFormSchema() {
    return Organizations.schema;
  },
});


AutoForm.addHooks('insertOrganizationForm', {
  onSuccess(formType, _id) {
    FlowRouter.go('organizations.show', { _id });

    this.event.preventDefault();
    return false;
  },
});

