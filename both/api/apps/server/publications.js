import { Meteor } from 'meteor/meteor';
import { Apps } from '../apps.js';
import { getMyOrganizationIdsForRoles } from '/both/api/organizations/my-organizations';

Meteor.publish('apps.public', () => Apps.find({}, { fields: Apps.publicFields }));

Meteor.publish('apps.private', () => {
  const organizationIds = getMyOrganizationIdsForRoles(['manager', 'developer', 'founder']);
  const fields = Object.assign({}, Apps.publicFields, Apps.privateFields);
  const selector = { organizationId: { $in: organizationIds } };
  const options = { fields };
  return Apps.find(selector, options);
});
