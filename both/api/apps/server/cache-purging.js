import { Meteor } from 'meteor/meteor';
import { Apps } from '../apps';
import addKeysToFastlyPurgingQueue from '../../../../server/cdn-purging/addKeysToFastlyPurgingQueue';

Meteor.startup(() => {
  // This purges all API responses of an app obtained via app-based API tokens from Fastly when
  // an app is changed or removed.
  
  Apps.find().observeChanges({
    changed(_id) {
      addKeysToFastlyPurgingQueue([_id]);
    },
    removed(_id) {
      addKeysToFastlyPurgingQueue([_id]);
    },
  });
});
