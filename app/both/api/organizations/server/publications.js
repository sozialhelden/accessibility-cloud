/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';

import { Organizations } from '../organizations.js';

import { getAccessibleOrganizationIdsForUserId } from '../privileges';
import { publishPublicFields, publishPrivateFields } from '/server/publish';


publishPublicFields('organizations', Organizations);

publishPrivateFields(
  'organizations',
  Organizations,
  userId => ({ _id: { $in: getAccessibleOrganizationIdsForUserId(userId) } }),
);

// Publishes private fields for all documents that reference an organization you are member of.
// You can optionally supply a function to limit the retrieved documents to a more specific set.
// The function is called with a userId argument and should return a selector.

export function publishPrivateFieldsForMembers(
  publicationName,
  collection,
  selectorFn = () => ({}),
  options = {}
) {
  check(publicationName, String);
  check(collection, Mongo.Collection);
  check(selectorFn, Function);

  const name = `${publicationName}.private`;

  console.log('Publishing', name, 'for referred organization members…');

  Meteor.publish(
    name,
    function publish(...args) {
      if (!collection.privateFields) {
        this.ready();
        return [];
      }

      const organizationIds = getAccessibleOrganizationIdsForUserId(this.userId);

      const specifiedSelector = selectorFn(this.userId, ...args);
      check(specifiedSelector, Match.ObjectIncluding({}));

      const selectorWithOrganizationId = Object.assign({}, specifiedSelector, {
        organizationId: { $in: organizationIds },
      });

      return collection.find(
        selectorWithOrganizationId,
        Object.assign({}, options, { fields: collection.privateFields })
      );
    }
  );
}
