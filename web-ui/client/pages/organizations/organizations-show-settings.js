import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Organizations } from '/both/api/organizations/organizations.js';

Template.organizations_show_settings_page.onCreated(function created() {
  window.Organizations = Organizations;

  this.autorun(() => {
    this.subscribe('organizations.public');
    this.subscribe('sources.public');
  });
});

Template.organizations_show_settings_page.helpers({
  organization() {
    return Organizations.findOne({ _id: FlowRouter.getParam('_id') });
  },
});
