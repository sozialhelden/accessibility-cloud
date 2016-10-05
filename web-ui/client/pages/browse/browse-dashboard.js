import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Organizations } from '/both/api/organizations/organizations.js';
import { Sources } from '/both/api/sources/sources.js';
import { OrganizationMembers } from '/both/api/organization-members/organization-members.js';
import subsManager from '/client/lib/subs-manager';
import { _ } from 'meteor/underscore';

Template.browse_dashboard_page.onCreated(function organizationsShowPageOnCreated() {
  subsManager.subscribe('organizations.public');
  subsManager.subscribe('sources.public');
  subsManager.subscribe('manage-subscriptions-for-current-user');
});


Template.browse_dashboard_page.onRendered(function organizationsShowPageOnRendered() {
  this.autorun(() => {
  });
});


Template.browse_dashboard_page.helpers({
  organizations() {
    return Organizations.find({});
  },
  sources() {
    return Sources.find({});
  },
  isUserMemberOfOrganizationWithId(_id) {
    const userId = Meteor.userId();
    const orgaIds = _.map(OrganizationMembers.find({ userId }).fetch(), function fetchOrgId(m) {
      return m.organizationId;
    });
    const isMember = orgaIds.indexOf(_id) !== -1;
    return isMember;
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
