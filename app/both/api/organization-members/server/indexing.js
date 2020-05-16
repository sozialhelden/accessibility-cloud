import { Meteor } from 'meteor/meteor';
import { OrganizationMembers } from '../organization-members';

Meteor.startup(() => {
  OrganizationMembers._ensureIndex({ organizationId: 1 });
  OrganizationMembers._ensureIndex({ invitationToken: 1 });
  OrganizationMembers._ensureIndex({ invitationEmailAddress: 1 });
  OrganizationMembers._ensureIndex({ userId: 1 });
  OrganizationMembers._ensureIndex({ role: 1 });
});
