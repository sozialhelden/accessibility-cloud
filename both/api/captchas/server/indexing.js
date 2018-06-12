import { Meteor } from 'meteor/meteor';
import { Captchas } from '../captchas';

Meteor.startup(() => {
  // find for upload
  Captchas._ensureIndex({ hashedIp: 1, appCode: 1, timestamp: 1, solution: 1 });
  // throttling
  Captchas._ensureIndex({ hashedIp: 1, timestamp: 1 });
  // cleaning cron job
  Captchas._ensureIndex({ timestamp: -1 });
});
