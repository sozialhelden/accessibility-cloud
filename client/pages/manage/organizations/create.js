import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { OrganizationMembers } from '/both/api/organization-members/organization-members.js';
import { AutoForm } from 'meteor/aldeed:autoform';

AutoForm.addHooks('insertOrganizationForm', {
  onSuccess(formType, _id) {
    FlowRouter.go('manage.organizations.show', { _id });

    this.event.preventDefault();
    return false;
  },
});
