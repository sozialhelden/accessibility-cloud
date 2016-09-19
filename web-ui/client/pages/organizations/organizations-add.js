import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Organizations } from '/both/api/organizations/organizations.js';
import { AutoForm } from 'meteor/aldeed:autoform';

Template.page_orgas_add.onCreated(function created() {
  window.Organizations = Organizations;

  this.autorun(() => {
    this.subscribe('organizations.public');
  });
});


AutoForm.addHooks('insertOrgaForm', {
  onSuccess(formType, _id) {
    FlowRouter.go('Organizations.show', { _id });

    this.event.preventDefault();
    return false;
  },
});


Template.page_orgas_add.helpers({
  organizationsFormSchema() {
    return Organizations.schema;
  },
});
