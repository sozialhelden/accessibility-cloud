import { Meteor } from 'meteor/meteor';
import { Organizations } from '/both/api/organizations/organizations.js';
import { userHasFullAccessToOrganization } from '/both/api/organizations/privileges';
import { OrganizationMembers } from '../organization-members.js';
import { TAPi18n } from 'meteor/tap:i18n';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { acceptInvitation, inviteUserToOrganization } from './invitations';

export const insert = new ValidatedMethod({
  name: 'organizationMembers.invite',
  validate: OrganizationMembers.simpleSchema()
    .pick(['invitationEmailAddress', 'organizationId'])
    .validator(),
  run({ invitationEmailAddress, organizationId }) {
    console.log('Inviting', invitationEmailAddress, 'to', organizationId, '...');

    if (!this.userId) {
      throw new Meteor.Error(401, TAPi18n.__('Please log in first.'));
    }

    const organization = Organizations.findOne({ _id: organizationId });

    if (!organization) {
      throw new Meteor.Error(404, TAPi18n.__('Organization not found'));
    }

    if (!userHasFullAccessToOrganization(this.userId, organization)) {
      throw new Meteor.Error(403,
        TAPi18n.__('You are not authorized to invite users to this organization.'));
    }

    return inviteUserToOrganization(invitationEmailAddress, organizationId, 'member');
  },
});

export const accept = new ValidatedMethod({
  name: 'organizationMembers.acceptInvitation',
  validate: OrganizationMembers.simpleSchema()
    .pick(['organizationId', 'invitationToken'])
    .validator(),
  run({ organizationId, invitationToken }) {
    // this.unblock();

    if (!this.userId) {
      throw new Meteor.Error(401, TAPi18n.__('Please log in first.'));
    }

    const organization = Organizations.findOne({ _id: organizationId });

    if (!organization) {
      throw new Meteor.Error(404, TAPi18n.__('Organization not found'));
    }

    return acceptInvitation(this.userId, organizationId, invitationToken);
  },
});
