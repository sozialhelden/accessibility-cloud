import { Meteor } from 'meteor/meteor';
import { Captchas } from '../captchas';

Meteor.startup(() => {
  Captchas._ensureIndex({ objectId: 1, hashedIp: 1, appCode: 1, timestamp: 1, solution: 1 });
  Captchas._ensureIndex({ timestamp: -1 });
});
