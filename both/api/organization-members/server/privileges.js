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
};

OrganizationMembers.helpers({
  editableBy(userId) {
    return userHasFullAccessToReferencedOrganization(userId, this);
  },
});

OrganizationMembers.visibleSelectorForUserId = (userId) => ({
  organizationId: { $in: getAccessibleOrganizationIdsForUserId(userId) },
});
