import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Organizations } from '/both/api/organizations/organizations.js';
import { userHasFullAccessToOrganizationId } from '/both/api/organizations/privileges';
import { OrganizationMembers } from '../organization-members.js';

Meteor.methods({
  'organizations.invite'(organizationId, userId) {
    check(organizationId, String);
    check(userId, String);

    if (!userHasFullAccessToOrganizationId(userId, organizationId)) {
      throw new Meteor.Error(403, 'Not authorized');
    }

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
