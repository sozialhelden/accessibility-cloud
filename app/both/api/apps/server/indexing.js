import { Meteor } from 'meteor/meteor';
import { Apps } from '../apps';

Meteor.startup(() => {
  Apps._ensureIndex({ organizationId: 1 });
  Apps._ensureIndex({ tokenString: 1 });
  Apps._ensureIndex({ tocForAppsAccepted: 1 });
});
