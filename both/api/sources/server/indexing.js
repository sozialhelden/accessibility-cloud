import { Meteor } from 'meteor/meteor';
import { Sources } from '../sources';

Meteor.startup(() => {
  Sources._ensureIndex({ licenseId: 1 });
  Sources._ensureIndex({ languageId: 1 });
  Sources._ensureIndex({ name: 1 });
  Sources._ensureIndex({ isFreelyAccessible: 1 });
  Sources._ensureIndex({ isDraft: 1 });
  Sources._ensureIndex({ accessRestrictedTo: 1 });
  Sources._ensureIndex({ organizationId: 1 });
});
