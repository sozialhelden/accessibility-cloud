import { Meteor } from 'meteor/meteor';
import { Apps } from '../apps';
import sendPurgeRequestToFastly from '../../../../server/cdn-purging/sendPurgeRequestToFastly';

Meteor.startup(() => {
  // This purges all API responses of an app obtained via app-based API tokens from Fastly when
  // an app is changed or removed.
  
  Apps.find().observeChanges({
    changed(_id) {
      sendPurgeRequestToFastly([_id]);
    },
    removed(_id) {
      sendPurgeRequestToFastly([_id]);
    },
  });
});
