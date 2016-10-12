import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Apps } from '/both/api/apps/apps';
import { Organizations } from '/both/api/organizations/organizations';
import { OrganizationMembers } from '/both/api/organization-members/organization-members';
import { Sources } from '/both/api/sources/sources';
import subsManager from '/client/lib/subs-manager';


Template.page_dashboard.onCreated(() => {
  subsManager.subscribe('organizations.withContent.mine');
});

const helpers = {
  organizations() {
    return Organizations.find({});
  },
  apps() {
    return Apps.find({});
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
