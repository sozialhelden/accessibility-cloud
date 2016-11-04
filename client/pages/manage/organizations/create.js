import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Organizations } from '/both/api/organizations/organizations.js';
import { AutoForm } from 'meteor/aldeed:autoform';
import subsManager from '/client/lib/subs-manager';

Template.organizations_create_page.onCreated(function created() {
  window.Organizations = Organizations;

  
});


Template.organizations_create_page.helpers({
  organizationsFormSchema() {
    return Organizations.schema;
  },
});


AutoForm.addHooks('insertOrganizationForm', {
  onSuccess(formType, _id) {
    // HACK this sould be called server-side

    Meteor.call('organizations.join', _id, Meteor.userId(), (err, result) => {
      //debugger;
    });

    FlowRouter.go('manage.organizations.show', { _id });

    this.event.preventDefault();
    return false;
  },
});
