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
  isFinished: 1,
};

SourceImports.statsFields = {
  startTimestamp: 1,
  isFinished: 1,
  insertedDocumentCount: 1,
  updatedDocumentCount: 1,
  documentCountAfterImport: 1,
  processedDocumentCount: 1,
  attributeDistribution: 1,
};

SourceImports.privateFields = {
  startTimestamp: 1,
  originalStreamChain: 1,
  insertedDocumentCount: 1,
  updatedDocumentCount: 1,
  documentCountAfterImport: 1,
  processedDocumentCount: 1,
  attributeDistribution: 1,
  streamChain: 1,
  error: 1,
};

SourceImports.helpers({
  editableBy(userId) {
    check(userId, String);
    return userHasFullAccessToReferencedOrganization(userId, this);
  },
});

// An import is visible if the user has access to its source.
SourceImports.visibleSelectorForUserId = (userId) => {
  if (!userId) { return null; }
  check(userId, String);
  const selector = Sources.visibleSelectorForUserId(userId);
  const sourceIds = Sources.find(selector, { fields: { _id: 1 } }).fetch().map(s => s._id);
  return {
    sourceId: { $in: sourceIds },
  };
};

SourceImports.visibleSelectorForAppId = (appId) => {
  check(appId, String);
  const selector = Sources.visibleSelectorForAppId(appId);
  const sourceIds = Sources.find(selector, { fields: { _id: 1 } }).fetch().map(s => s._id);
  return {
    sourceId: { $in: sourceIds },
  };
};

SourceImports.fromFreelyAccessibleSourcesSelector = () => {
  const freelyAccessibleSourceIds = Sources.find(
    { isFreelyAccessible: 1 },
    { fields: { _id: 1 } }
  ).fetch().map(source => source._id);

  return {
    _id: { $in: freelyAccessibleSourceIds },
  };
};
