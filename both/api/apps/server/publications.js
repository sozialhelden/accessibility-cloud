import { Meteor } from 'meteor/meteor';
import { Apps } from '../apps.js';
import { getAccessibleOrganizationIdsForRoles } from '/both/api/organizations/privileges';
import { publishPublicFields } from '/server/publish';
import { publishPrivateFieldsForMembers } from '/both/api/organizations/server/publications';

publishPublicFields('apps', Apps);
publishPrivateFieldsForMembers('apps', Apps);

// Additionally publish app tokens for organization managers

Meteor.publish('apps.private', function publish() {
  const organizationIds = getAccessibleOrganizationIdsForRoles(
    this.userId, ['manager', 'developer', 'founder'],
  );
  const selector = { organizationId: { $in: organizationIds } };
  const options = { fields: { tokenString: 1 } };
  console.log('Publishing apps.private for user', this.userId, selector, options);
  return Apps.find(selector, options);
});
