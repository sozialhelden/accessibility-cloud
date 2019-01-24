import { Meteor } from 'meteor/meteor';
import { Licenses } from '../licenses';
import sendPurgeRequestToFastly from '../../../../server/cdn-purging/sendPurgeRequestToFastly';

// This automatically purges place JSON responses of this license, as all place responses
// have a license included
Meteor.startup(() => {
  Licenses.find().observeChanges({
    changed(_id) {
      sendPurgeRequestToFastly([_id]);
    },
    removed(_id) {
      sendPurgeRequestToFastly([_id]);
    },
  });
});
