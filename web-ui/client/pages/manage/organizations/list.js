import { Template } from 'meteor/templating';
import { Organizations } from '/both/api/organizations/organizations.js';
import subsManager from '/client/lib/subs-manager';
// import { FlowRouter } from 'meteor/kadira:flow-router';

Template.organizations_list_page.onCreated(function organizationsShowPageOnCreated() {
  subsManager.subscribe('organizations.public');
});


Template.organizations_list_page.onRendered(function organizationsShowPageOnRendered() {
  this.autorun(() => {
  });
});


Template.organizations_list_page.helpers({
  organizations() {
    return Organizations.find({});
  },
});

