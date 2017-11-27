import { _ } from 'lodash';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { OrganizationMembers } from '../organization-members';
import { Apps } from '/both/api/apps/apps';
import {
  getAccessibleOrganizationIdsForUserId,
  userHasFullAccessToReferencedOrganization,
} from '/both/api/organizations/privileges';

OrganizationMembers.allow({
  insert: userHasFullAccessToReferencedOrganization,
  update: userHasFullAccessToReferencedOrganization,
  remove: userHasFullAccessToReferencedOrganization,
});

// Allow to remove your own organization memberships
OrganizationMembers.allow({
  remove(userId, organizationMember) {
    return organizationMember.userId === userId;
  },
});

OrganizationMembers.publicFields = {
  organizationId: 1,
  userId: 1,
  role: 1,
  invitationState: 1,
  invitationError: 1,
  invitationEmailAddress: 1,
  gravatarHash: 1,
};

OrganizationMembers.helpers({
  editableBy(userId) {
    check(userId, String);
    return userHasFullAccessToReferencedOrganization(userId, this);
  },
});

OrganizationMembers.visibleSelectorForUserId = (userId) => {
  if (!userId) {
    return null;
  }

  check(userId, String);
  return {
    organizationId: { $in: getAccessibleOrganizationIdsForUserId(userId) },
  };
};

OrganizationMembers.visibleSelectorForAppId = (appId) => {
  check(appId, String);
  const app = Apps.findOne(appId);
  return { organizationId: app.organizationId };
};

Meteor.users.publicFields = {
  'emails.address': 1,
  'emails.verified': 1,
  'services.facebook.id': 1,
  'services.google.picture': 1,
  'services.twitter.profile_image_url_https': 1,
  isApproved: 1,
  isAdmin: 1,
  profile: 1,
};

function getUserSelectorForMemberSelector(selector) {
  const members = OrganizationMembers.find(
    selector,
    { fields: { userId: 1 }, transform: null },
  ).fetch();
  return { _id: { $in: _.compact(_.uniq(_.map(members, (m => m.userId)))) } };
}

Meteor.users.visibleSelectorForUserId = (userId) => {
  check(userId, String);
  return getUserSelectorForMemberSelector(OrganizationMembers.visibleSelectorForUserId(userId));
};

Meteor.users.visibleSelectorForAppId = (appId) => {
  check(appId, String);
  const app = Apps.findOne(appId);
  return getUserSelectorForMemberSelector({ organizationId: app.organizationId });
};
