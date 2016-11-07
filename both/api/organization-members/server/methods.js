import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Organizations } from '/both/api/organizations/organizations.js';
import { userHasFullAccessToOrganizationId } from '/both/api/organizations/privileges';
import { OrganizationMembers } from '../organization-members.js';
import { TAPi18n } from 'meteor/tap:i18n';

Meteor.methods({
  'organizations.invite'(organizationId, userId) {
    check(organizationId, String);
    check(userId, String);

    if (!this.userId) {
      throw new Meteor.Error(401, TAPi18n.__('Please log in first.'));
    }

    if (!userHasFullAccessToOrganizationId(this.userId, organizationId)) {
      throw new Meteor.Error(403,
        TAPi18n.__('You are not authorized to invite users to this organization.'));
    }

    const user = Meteor.users.findOne({ _id: userId });
    if (!user) {
      throw new Meteor.Error(404, TAPi18n.__('User not found.'));
    }

    const organization = Organizations.findOne({ _id: organizationId });
    if (!organization) {
      throw new Meteor.Error(404, TAPi18n.__('Organization not found'));
    }

    const existingMembership = OrganizationMembers.findOne({
      organizationId,
      userId,
    });

    if (existingMembership) {
      console.log('Did not invite user', userId, 'to organization', organizationId,
        '- membership exists already.');
      // Do not throw an error here, as the method would not be idempotent anymore in this case.
      // If it is called twice, just return the existing membership id.
      return existingMembership._id;
    }

    return OrganizationMembers.insert({
      organizationId,
      userId,
      role: 'undefined',
    });
  },
});
