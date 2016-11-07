import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Sources } from '../sources';
import { TAPi18n } from 'meteor/tap:i18n';
import {
  getOrganizationIdsForUserId,
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
  description: 1,
  originWebsite: 1,
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
  const organizationIds = getOrganizationIdsForUserId(userId);
  return {
    $or: [
      { organizationId: { $in: organizationIds } },
      {
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
