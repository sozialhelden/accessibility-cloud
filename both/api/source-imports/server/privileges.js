import { check } from 'meteor/check';
import {
  getAccessibleOrganizationIdsForUserId,
  userHasFullAccessToReferencedOrganization,
} from '/both/api/organizations/privileges';
import { SourceImports } from '../source-imports';
import { Sources } from '/both/api/sources/sources';

SourceImports.allow({
  insert: userHasFullAccessToReferencedOrganization,
  update: userHasFullAccessToReferencedOrganization,
  remove: userHasFullAccessToReferencedOrganization,
});

SourceImports.publicFields = {
  sourceId: 1,
  streamChain: 1,
  startTimestamp: 1,
  insertedPlaceInfoCount: 1,
  updatedPlaceInfoCount: 1,
  placeInfoCountAfterImport: 1,
  processedPlaceInfoCount: 1,
  error: 1,
};

SourceImports.helpers({
  editableBy(userId) {
    check(userId, String);
    return userHasFullAccessToReferencedOrganization(userId, this);
  },
});

SourceImports.visibleSelectorForUserId = (userId) => {
  if (!userId) {
    return null;
  }

  check(userId, String);
  return {
    organizationId: { $in: getAccessibleOrganizationIdsForUserId(userId) },
  };
};

SourceImports.visibleSelectorForAppId = (appId) => {
  check(appId, String);
  return {
    _id: { $in: Sources.visibleSelectorForAppId(appId) },
  };
};
