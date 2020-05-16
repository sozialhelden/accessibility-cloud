import { Meteor } from 'meteor/meteor';
import { AppLinks } from '../app-links';
import { Apps } from '../../apps/apps';
import { getAccessibleOrganizationIdsForRoles } from '../../../../both/api/organizations/privileges';
import { publishPublicFields } from '../../../../server/publish';

publishPublicFields('appLinks', AppLinks);

Meteor.publish('appLinks.private.withToken', function publish() {
  const organizationIds = getAccessibleOrganizationIdsForRoles(
    this.userId, ['manager', 'developer', 'founder'],
  );
  const selector = { organizationId: { $in: organizationIds } };
  const options = { fields: { tokenString: 1, _id: 1 } };
  console.log('Publishing appLinks.private.withToken for user', this.userId, selector, options);
  const appIds = Apps.find(selector, options).map(app => app._id);
  return AppLinks.find({ appId: { $in: appIds } });
});
