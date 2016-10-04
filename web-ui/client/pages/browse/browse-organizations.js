import { Template } from 'meteor/templating';
import { Organizations } from '/both/api/organizations/organizations.js';

Template.browse_organizations_page.onCreated(function organizationsShowPageOnCreated() {
  this.autorun(() => {
    this.subscribe('organizations.public');
  });
});


Template.browse_organizations_page.onRendered(function organizationsShowPageOnRendered() {
  this.autorun(() => {
  });
});


Template.browse_organizations_page.helpers({
  organizations() {
    return Organizations.find({});
  },
});
