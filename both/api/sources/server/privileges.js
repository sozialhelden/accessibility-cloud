import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { TAPi18n } from 'meteor/tap:i18n';
import { Sources } from '../sources';
import { Organizations } from '/both/api/organizations/organizations';
import { Apps } from '/both/api/apps/apps';
import {
  getAccessibleOrganizationIdsForUserId,
  userHasFullAccessToReferencedOrganization,
  userHasFullAccessToOrganizationId,
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
  shortName: 1,
  description: 1,
  originWebsiteURL: 1,
  languageId: 1,
  isDraft: 1,
  isFreelyAccessible: 1,
  isRequestable: 1,
  accessRestrictedTo: 1,
  hasRunningImport: 1,
  placeInfoCount: 1,
};

Sources.privateFields = {
  streamChain: 1,
};

Sources.helpers({
  editableBy(userId) {
    check(userId, String);
    return userHasFullAccessToReferencedOrganization(userId, this);
  },
});

Sources.deny({
  update(userId, source, fields) {
    // Don't allow to change this flag on the client
    return fields.includes('hasRunningImport');
  },
});

function sourceSelectorForOrganizationIds(organizationIds) {
  check(organizationIds, [String]);

  const otherOrganizationIdsWithAcceptedToS = Organizations.find(
    { tocForOrganizationsAccepted: true },
    { fields: { _id: 1 } }
  ).map(organization => organization._id);

  return {
    $or: [
      // match sources of my own organizations
      { organizationId: { $in: organizationIds } },
      // match published freely accessible sources of other organizations that have accepted ToS
      {
        isDraft: false,
        isFreelyAccessible: true,
        organizationId: { $in: otherOrganizationIdsWithAcceptedToS },
      },
      // match published restricted-access sources of other organizations that have accepted ToS
      {
        isDraft: false,
        isFreelyAccessible: false,
        organizationId: { $in: otherOrganizationIdsWithAcceptedToS },
        accessRestrictedTo: { $elemMatch: { $in: organizationIds } },
      },
    ],
  };
}

Sources.visibleSelectorForUserId = (userId) => {
  check(userId, Match.Maybe(String));
  return sourceSelectorForOrganizationIds(getAccessibleOrganizationIdsForUserId(userId));
};

Sources.visibleSelectorForAppId = (appId) => {
  check(appId, String);
  const app = Apps.findOne(appId);
  const organizationId = app.organizationId;
  return sourceSelectorForOrganizationIds([organizationId]);
};

export function checkExistenceAndFullAccessToSourceId(userId, sourceId) {
  check(sourceId, String);
  check(userId, String);

  if (!userId) {
    throw new Meteor.Error(401, TAPi18n.__('Please log in first.'));
  }

  const source = Sources.findOne({ _id: sourceId });
  if (!source) {
    throw new Meteor.Error(404, TAPi18n.__('Source not found.'));
  }

  if (!userHasFullAccessToOrganizationId(userId, source.organizationId)) {
    throw new Meteor.Error(401, TAPi18n.__('Not authorized.'));
  }

  return source;
}

export function checkExistenceAndVisibilityForSourceId(userId, sourceId) {
  check(sourceId, String);
  check(userId, String);

  if (!userId) {
    throw new Meteor.Error(401, TAPi18n.__('Please log in first.'));
  }

  const source = Sources.findOne({
    $and: [
      Sources.visibleSelectorForUserId(userId),
      { _id: sourceId },
    ],
  });
  if (!source) {
    throw new Meteor.Error(404, TAPi18n.__('Source not found or not visible.'));
  }

  return source;
}
