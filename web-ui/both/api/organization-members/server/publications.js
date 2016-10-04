/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { OrganizationMembers } from '../organization-members.js';

Meteor.publish('organization.members', function organizationMembersPublic() {
  return OrganizationMembers.find({});
});
