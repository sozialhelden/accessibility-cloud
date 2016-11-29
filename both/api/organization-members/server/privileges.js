import { _ } from 'lodash';
import { Meteor } from 'meteor/meteor';
import { OrganizationMembers } from '../organization-members';
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
    return userHasFullAccessToReferencedOrganization(userId, this);
  },
});

OrganizationMembers.visibleSelectorForUserId = (userId) => ({
  organizationId: { $in: getAccessibleOrganizationIdsForUserId(userId) },
});

Meteor.users.publicFields = {
  'emails.address': 1,
  'emails.verified': 1,
  'services.facebook.id': 1,
  'services.google.picture': 1,
  'services.twitter.profile_image_url_https': 1,
  profile: 1,
};

Meteor.users.visibleSelectorForUserId = (userId) => {
  const members = OrganizationMembers.find(
    OrganizationMembers.visibleSelectorForUserId(userId),
    { fields: { userId: 1 }, transform: null }
  ).fetch();
  return { _id: { $in: _.compact(_.uniq(_.map(members, (m => m.userId)))) } };
};
