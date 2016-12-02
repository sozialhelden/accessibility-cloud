import { isAdmin } from '/both/lib/is-admin';
import { isApproved } from '/both/lib/is-approved';
import { check, Match } from 'meteor/check';
import { OrganizationMembers } from '/both/api/organization-members/organization-members';
import { Organizations } from '/both/api/organizations/organizations';


export function isUserMemberOfOrganizationWithId(userId, organizationId) {
  if (!userId || !organizationId) {
    return false;
  }
  check(userId, String);
  check(organizationId, String);
  return OrganizationMembers.find({ userId, organizationId }).count() > 0;
}

// An organization is accessible for a user when they are a member or when they are admin.

export function getAccessibleOrganizationIdsForUserId(userId) {
  if (!userId) {
    return [];
  }
  check(userId, String);

  const selector = isAdmin(userId) ? {} : { userId };

  return OrganizationMembers
    .find(selector, { fields: { organizationId: 1 } })
    .fetch()
    .map(member => member.organizationId);
}

// Functions for retrieving which roles a user has in which organization.
// Note that admins are regarded as having all roles in all organizations.

export function getAccessibleOrganizationIdsForRoles(userId, includedRoles = []) {
  if (!userId) {
    return [];
  }

  check(includedRoles, [String]);
  check(userId, String);

  if (isAdmin(userId)) {
    return Organizations.find({}, { transform: null, fields: { _id: 1 } }).fetch().map(o => o._id);
  }

  return OrganizationMembers.find({
    userId,
    $or: includedRoles.map(role => ({ role })),
  }).map(member => member.organizationId);
}


// Returns true if the user has one of the given roles in the given organization, false otherwise.
// Admins are considered as having all roles in every organization.

export function userHasRole(userId, organizationId, includedRoles = []) {
  if (!userId || !organizationId || !includedRoles) {
    return false;
  }
  check(userId, String);
  check(organizationId, String);
  check(includedRoles, [String]);

  if (isAdmin(userId)) {
    return true;
  }

  const organizationIds = getAccessibleOrganizationIdsForRoles(userId, includedRoles);
  return organizationIds.includes(organizationId);
}


// Returns true if the user is admin or can manage the organization with the given id, false
// otherwise. Admins are considered as having all roles in every organization.

export function userHasFullAccessToOrganizationId(userId, organizationId) {
  if (!userId || !organizationId) {
    return false;
  }
  check(userId, String);
  check(organizationId, String);

  return isAdmin(userId) ||
    isApproved(userId) &&
    userHasRole(userId, organizationId, ['manager', 'developer', 'founder']);
}

export function userHasFullAccessToOrganization(userId, organization) {
  if (!userId || !organization) {
    return false;
  }
  check(userId, String);
  check(organization._id, String);

  return userHasFullAccessToOrganizationId(userId, organization._id);
}

// Returns true if the user is admin or can manage the organization referenced in the given MongoDB
// document, false otherwise.

export function userHasFullAccessToReferencedOrganization(userId, doc) {
  if (!userId || !doc) {
    return false;
  }
  check(userId, String);
  check(doc.organizationId, String);

  return userHasFullAccessToOrganizationId(userId, doc.organizationId);
}
