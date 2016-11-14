import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Organizations } from '/both/api/organizations/organizations.js';
import { Sources } from '/both/api/sources/sources.js';
import { isUserMemberOfOrganizationWithId } from '/both/api/organizations/privileges.js';
import { helpers } from '/client/_layouts/helpers';
import { isAdmin } from '/both/lib/is-admin';
import subsManager from '/client/lib/subs-manager';
import { _ } from 'meteor/underscore';


Template.browse_dashboard_page.onCreated(function organizationsShowPageOnCreated() {
  subsManager.subscribe('organizations.public');
  subsManager.subscribe('sources.public');
  subsManager.subscribe('licenses.public');

});


Template.browse_dashboard_page.onRendered(function organizationsShowPageOnRendered() {
  this.autorun(() => {
  });
});

Template.browse_dashboard_page.helpers(helpers);

Template.browse_dashboard_page.helpers({
  isAdmin() {
    return isAdmin(Meteor.userId());
  },
  isUserMemberOfOrganizationWithId,
  organizations() {
    return Organizations.find({});
  },
  sources() {
    return Sources.find({});
  },
});

Template.browse_dashboard_page.events({
  'click .join': function (event) {
    event.preventDefault();

    Meteor.call('organizations.join', this._id, Meteor.userId(), (err, result) => {
      //debugger;
    });
  },
});
