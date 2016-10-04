import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Organizations } from '/both/api/organizations/organizations.js';
import subsManager from '/client/lib/subs-manager';

Template.organizations_show_settings_page.onCreated(function created() {
  window.Organizations = Organizations;

  subsManager.subscribe('organizations.public');
  subsManager.subscribe('sources.public');
});

Template.organizations_show_settings_page.helpers({
  organization() {
    return Organizations.findOne({ _id: FlowRouter.getParam('_id') });
  },
});
