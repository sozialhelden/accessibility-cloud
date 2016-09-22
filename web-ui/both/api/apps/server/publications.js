/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { Apps } from '../apps.js';

Meteor.publish('apps.public', function appsPublic() {
  return Apps.find({}, { fields: Apps.publicFields });
});
