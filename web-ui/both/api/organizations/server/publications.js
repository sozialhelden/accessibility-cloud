/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
// import { check } from 'meteor/check';
import { Organizations } from '../organizations.js';
import { OrganizationMembers } from '/both/api/organization-members/organization-members.js';
import { Sources } from '/both/api/sources/sources.js';
import { Apps } from '/both/api/apps/apps.js';
import { _ } from 'meteor/underscore';


Meteor.publish('organizations.public', function organizationsPublic() {
  return Organizations.find({});
});

Meteor.publish('organizations.withContent.mine', function manageSubscriptionsForCurrentUser() {
  const userId = this.userId;
  if (!userId) {
    return [];
  }

  const membershipsCursor = OrganizationMembers.find({ userId });
  const memberships = membershipsCursor.fetch();

  const orgaIds = _.map(memberships, function fetchId(m) {
    return m.organizationId;
  });

  return [
    membershipsCursor,
    Organizations.find({
      _id: {
        $in: orgaIds,
      },
    }),
    Sources.find({
      organizationId: {
        $in: orgaIds,
      },
    }),
    Apps.find({
      organizationId: {
        $in: orgaIds,
      },
    }),
  ];
});
