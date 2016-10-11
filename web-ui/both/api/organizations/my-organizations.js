import { check } from 'meteor/check';
import { OrganizationMembers } from '/both/api/organization-members/organization-members';

export function getMyOrganizationIdsForRoles(includedRoles = []) {
  check(includedRoles, [String]);
  const members = OrganizationMembers.find({
    userId: this.userId,
    $or: includedRoles.map(role => ({ role })),
  });
  return members.map(member => member.organizationId);
}
