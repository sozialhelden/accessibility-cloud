import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Organizations } from '/both/api/organizations/organizations.js';
import { AutoForm } from 'meteor/aldeed:autoform';

AutoForm.addHooks('insertOrganizationForm', {
  onSuccess(formType, _id) {
    FlowRouter.go('manage.organizations.show', { _id });

    this.event.preventDefault();
    return false;
  },
});

Template.organizations_create_page.helpers({
  Organizations,
});
