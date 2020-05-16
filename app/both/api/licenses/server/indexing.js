import { Meteor } from 'meteor/meteor';
import { Licenses } from '../licenses';

Meteor.startup(() => {
  Licenses._ensureIndex({ name: 1 });
  Licenses._ensureIndex({ organizationId: 1 });
  Licenses._ensureIndex({ consideredAs: 1 });
});
