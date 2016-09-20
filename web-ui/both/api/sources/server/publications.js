/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { Sources } from '../sources.js';

Meteor.publish('sources.public', function sourcesPublic() {
  return Sources.find({});
});
