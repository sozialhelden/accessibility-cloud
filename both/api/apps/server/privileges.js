import {
  getOrganizationIdsForUserId,
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
};

Apps.privateFields = {
  tocForAppsAccepted: 1,
};

Apps.visibleSelectorForUserId = (userId) => ({
  organizationId: { $in: getOrganizationIdsForUserId(userId) },
});

Apps.helpers({
  editableBy(userId) {
    return userHasFullAccessToReferencedOrganization(userId, this);
  },
});
