import { check } from 'meteor/check';
import {
  getAccessibleOrganizationIdsForUserId,
  userHasFullAccessToReferencedOrganization,
} from '/both/api/organizations/privileges';

import { Apps } from '../apps.js';

Apps.allow({
  insert: userHasFullAccessToReferencedOrganization,
  update: userHasFullAccessToReferencedOrganization,
  remove: userHasFullAccessToReferencedOrganization,
});

Apps.deny({
  update(userId, doc, fieldNames) {
    return fieldNames.includes('tokenString');
  },
});

Apps.publicFields = {
  organizationId: 1,
  name: 1,
  description: 1,
  website: 1,
  clientSideConfiguration: 1,
};

Apps.privateFields = {
  tocForAppsAccepted: 1,
};

Apps.visibleSelectorForUserId = (userId) => {
  if (!userId) {
    return null;
  }
  check(userId, String);
  return { organizationId: { $in: getAccessibleOrganizationIdsForUserId(userId) } };
};

// Apps can only see themselves
Apps.visibleSelectorForAppId = () => ({});

Apps.helpers({
  editableBy(userId) {
    check(userId, String);
    debugger
    return userHasFullAccessToReferencedOrganization(userId, this);
  },
});
