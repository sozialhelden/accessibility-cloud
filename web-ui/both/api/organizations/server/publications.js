/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { Organizations } from '../organizations.js';

Meteor.publish('organizations.public', function organizationsPublic() {
  return Organizations.find({});
});
