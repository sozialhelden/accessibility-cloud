import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Apps } from '/both/api/apps/apps';
import { Organizations } from '/both/api/organizations/organizations';
import { OrganizationMembers } from '/both/api/organization-members/organization-members';
import { Sources } from '/both/api/sources/sources';
import subsManager from '/client/lib/subs-manager';
import { getOrganizationIdsForUserId } from '/both/api/organizations/privileges';

Template.page_dashboard.onCreated(() => {
  subsManager.subscribe('organizations.public');
  subsManager.subscribe('organizations.private');
  subsManager.subscribe('organizationMembers.public');
  subsManager.subscribe('organizationMembers.private');
  subsManager.subscribe('apps.public');
  subsManager.subscribe('apps.private');
  subsManager.subscribe('sources.public');
  subsManager.subscribe('sources.private');
});

const helpers = {
  organizations() {
    return Organizations.find({ _id: { $in: getOrganizationIdsForUserId(Meteor.userId()) } });
  },
  apps() {
    return Apps.find({ organizationId: { $in: getOrganizationIdsForUserId(Meteor.userId()) } });
  },
  sources() {
    return Sources.find({ organizationId: { $in: getOrganizationIdsForUserId(Meteor.userId()) } });
  },
  firstOrganizationId() {
    const firstMembership = OrganizationMembers.findOne({ userId: Meteor.userId() });
    return firstMembership && firstMembership.organizationId;
  },
};

Template.page_dashboard.helpers(helpers);
Template.dashboard_header_navigation.helpers(helpers);
