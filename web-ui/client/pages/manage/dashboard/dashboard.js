import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Organizations } from '/both/api/organizations/organizations.js';
import { OrganizationMembers } from '/both/api/organization-members/organization-members.js';
import { Sources } from '/both/api/sources/sources.js';
import subsManager from '/client/lib/subs-manager';


Template.page_dashboard.onCreated(() => {
  subsManager.subscribe('organizations.withContent.mine');
});

const helpers = {
  organizations() {
    return Organizations.find({});
  },
  sources() {
    return Sources.find({});
  },
  firstOrganizationId() {
    const firstMembership = OrganizationMembers.findOne({ userId: Meteor.userId() });
    return firstMembership && firstMembership.organizationId;
  },
};

Template.page_dashboard.helpers(helpers);
Template.dashboard_header_navigation.helpers(helpers);
