import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { TAPi18n } from 'meteor/tap:i18n';
import { Sources } from '../sources';
import { Organizations } from '/both/api/organizations/organizations';
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
  const organizationIds = getAccessibleOrganizationIdsForUserId(userId);
  const organizationIdsWithAcceptedToS = Organizations.find(
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
        organizationId: { $in: organizationIdsWithAcceptedToS },
      },
      // match published restricted-access sources of other organizations that have accepted ToS
      {
        isDraft: false,
        isFreelyAccessible: false,
        tocForSourcesAccepted: true,
        organizationId: { $in: organizationIdsWithAcceptedToS },
        accessRestrictedTo: { $elemMatch: { $in: organizationIds } },
      },
    ],
  };
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
