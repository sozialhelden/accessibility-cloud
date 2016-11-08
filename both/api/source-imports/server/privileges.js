import {
  getAccessibleOrganizationIdsForUserId,
  userHasFullAccessToReferencedOrganization,
} from '/both/api/organizations/privileges';
import { SourceImports } from '../source-imports';

SourceImports.allow({
  insert: userHasFullAccessToReferencedOrganization,
  update: userHasFullAccessToReferencedOrganization,
  remove: userHasFullAccessToReferencedOrganization,
});

SourceImports.publicFields = {
  sourceId: 1,
  streamChain: 1,
  startTimestamp: 1,
  numberOfPlacesAdded: 1,
  numberOfPlacesModified: 1,
  numberOfPlacesRemoved: 1,
  numberOfPlacesUnchanged: 1,
};

SourceImports.helpers({
  editableBy(userId) {
    return userHasFullAccessToReferencedOrganization(userId, this);
  },
});

SourceImports.visibleSelectorForUserId = (userId) => ({
  organizationId: { $in: getAccessibleOrganizationIdsForUserId(userId) },
});
