import { Sources } from '../sources';
import {
  getOrganizationIdsForUserId,
  userHasFullAccessToReferencedOrganization,
} from '/both/api/organizations/privileges';

Sources.allow({
  insert: userHasFullAccessToReferencedOrganization,
  update: userHasFullAccessToReferencedOrganization,
  remove: userHasFullAccessToReferencedOrganization,
});

Sources.publicFields = {
  organizationId: 1,
  licenseId: 1,
  name: 1,
  description: 1,
  originWebsite: 1,
  languageId: 1,
  isDraft: 1,
  tocForSourcesAccepted: 1,
  streamChain: 1,
  isFreelyAccessible: 1,
  accessRestrictedTo: 1,
};

Sources.helpers({
  editableBy(userId) {
    return userHasFullAccessToReferencedOrganization(userId, this);
  },
});

Sources.visibleSelectorForUserId = (userId) => {
  const organizationIds = getOrganizationIdsForUserId(userId);
  return {
    $or: [
      { organizationId: { $in: organizationIds } },
      {
        tocForSourcesAccepted: true,
        isDraft: false,
        isFreelyAccessible: true,
      },
      {
        isDraft: false,
        isFreelyAccessible: false,
        tocForSourcesAccepted: true,
        accessRestrictedTo: {
          $elemMatch: { $in: organizationIds },
        },
      },
    ],
  };
};
