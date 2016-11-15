import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Organizations } from '/both/api/organizations/organizations.js';
import { Sources } from '/both/api/sources/sources.js';
import { isUserMemberOfOrganizationWithId } from '/both/api/organizations/privileges.js';
import { helpers } from '/client/_layouts/helpers';
import subsManager from '/client/lib/subs-manager';
import { _ } from 'meteor/underscore';


Template.admin_page.onCreated(function organizationsShowPageOnCreated() {
  subsManager.subscribe('organizations.public');
  subsManager.subscribe('sources.public');
  subsManager.subscribe('licenses.public');
});


Template.admin_page.onRendered(function organizationsShowPageOnRendered() {
  this.autorun(() => {
  });
});

Template.admin_page.helpers(helpers);

Template.admin_page.helpers({
  isUserMemberOfOrganizationWithId,
  organizations() {
    return Organizations.find({});
  },
  sources() {
    return Sources.find({});
  },
});

Template.admin_page.events({
  'click .join': function (event) {
    event.preventDefault();

    Meteor.call('organizations.join', this._id, Meteor.userId(), (err, result) => {
      //debugger;
    });
  },
});
