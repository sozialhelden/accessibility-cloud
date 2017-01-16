import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Apps } from '/both/api/apps/apps';
import { Organizations } from '/both/api/organizations/organizations';
import { OrganizationMembers } from '/both/api/organization-members/organization-members';
import { Sources } from '/both/api/sources/sources';
import subsManager from '/client/lib/subs-manager';
import { getAccessibleOrganizationIdsForUserId } from '/both/api/organizations/privileges';
import { _ } from 'meteor/underscore';
import { SEO } from '/client/seo.js';

Template.page_dashboard.onCreated(() => {
  subsManager.subscribe('organizations.public');
  subsManager.subscribe('organizations.private');
  subsManager.subscribe('organizationMembers.public');
  subsManager.subscribe('organizationMembers.private');
  subsManager.subscribe('apps.public');
  subsManager.subscribe('apps.private');
  subsManager.subscribe('sources.public');
  subsManager.subscribe('sources.private');
  subsManager.subscribe('licenses.public');

  SEO.set({ title: 'Dashboard – accessibility.cloud' });
});

const helpers = {
  Organizations,
  organizations() {
    return Organizations.find({
      _id: {
        $in: getAccessibleOrganizationIdsForUserId(Meteor.userId()),
      } });
  },
  apps() {
    return Apps.find({ organizationId: {
      $in: getAccessibleOrganizationIdsForUserId(Meteor.userId()),
    } });
  },
  sources() {
    return Sources.find({
      organizationId: {
        $in: getAccessibleOrganizationIdsForUserId(Meteor.userId()),
      } });
  },
  sourcesNotOf(organizations) {
    if (!organizations) {
      return [];
    }
    // console.log(organizations);
    const ids = _.pluck(organizations.fetch(), '_id');
    return Sources.find({ organizationId: { $nin: ids }, isDraft: false });
  },
  firstOrganizationId() {
    const firstMembership = OrganizationMembers.findOne({ userId: Meteor.userId() });
    return firstMembership && firstMembership.organizationId;
  },
  classIfDraft() {
    return this.isDraft ? 'is-draft' : '';
  },
};

Template.page_dashboard.helpers(helpers);
Template.dashboard_header_navigation.helpers(helpers);
