/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { Categories } from '../categories.js';

Meteor.publish('categories.public', function categoriesPublic() {
  return Categories.find({}, { fields: Categories.publicFields });
});
