import { Meteor } from 'meteor/meteor';
import { Images } from '../images';

Meteor.startup(() => {
  // prevent re-uploading foreign images multiple times
  Images._ensureIndex({ originalId: 1 });
  // for rest api
  Images._ensureIndex({ objectId: 1, context: 1, isUploadedToS3: 1, moderationRequired: 1 });
  // throttling, filter by ip & order by time
  Images._ensureIndex({ hashedIp: 1, timestamp: 1 });
});
