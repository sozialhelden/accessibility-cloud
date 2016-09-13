import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Organizations } from '../../api/organizations/organizations.js';
import './organizations-list-page.html';

Template.Organizations_list_page.onCreated(function organizationsShowPageOnCreated() {
  this.autorun(() => {
    this.subscribe('organizations.public');
  });
});

Template.Organizations_list_page.onRendered(function organizationsShowPageOnRendered() {
  this.autorun(() => {
  });
});

Template.Organizations_list_page.helpers({
  // We use #each on an array of one item so that the "list" template is
  // removed and a new copy is added when changing lists, which is
  // important for animation purposes.
  organizations() {
    return Organizations.find({});
  },

});

