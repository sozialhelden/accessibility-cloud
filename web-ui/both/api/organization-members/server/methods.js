import { Meteor } from 'meteor/meteor';
// import { ValidatedMethod } from 'meteor/mdg:validated-method';
// import { SimpleSchema } from 'meteor/aldeed:simple-schema';
// import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
// import { _ } from 'meteor/underscore';
import { check } from 'meteor/check';
import { Organizations } from '/both/api/organizations/organizations.js';
import { OrganizationMembers } from '../organization-members.js';

// FIXME: this should be a server-side post-organization-create hook
Meteor.methods({
  'organizations.join'(organizationId, userId) {
    check(organizationId, String);
    check(userId, String);

    const user = Meteor.users.findOne({ _id: userId });
    if (!user) {
      return { error: `user with id ${userId} not found` };
    }

    const organization = Organizations.findOne({ _id: organizationId });
    if (!organization) {
      return { error: `Organization with id ${organizationId} not found` };
    }

    const existingMembership = OrganizationMembers.findOne({
      organizationId,
      userId,
    });
    if (existingMembership) {
      console.log('membership already exists');
      return { error: 'membership already exists' };
    }

    return OrganizationMembers.insert({
      organizationId,
      userId,
      role: 'undefined',
    });
  },
});
