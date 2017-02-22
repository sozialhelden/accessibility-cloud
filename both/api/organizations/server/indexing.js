import { Meteor } from 'meteor/meteor';
import { Organizations } from '../organizations';

Meteor.startup(() => {
  Organizations._ensureIndex({ name: 1 });
  Organizations._ensureIndex({ tocForOrganizationsAccepted: 1 });
});
