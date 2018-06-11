import { Meteor } from 'meteor/meteor';
import { Images } from '../images';

Meteor.startup(() => {
  Images._ensureIndex({ placeId: 1 });
  Images._ensureIndex({ hashedIp: 1 });
});
