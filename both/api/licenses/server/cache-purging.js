import { Meteor } from 'meteor/meteor';
import { Licenses } from '../licenses';
import addKeysToFastlyPurgingQueue from '../../../../server/cdn-purging/addKeysToFastlyPurgingQueue';

// This automatically purges place JSON responses of this license, as all place responses
// have a license included
Meteor.startup(() => {
  Licenses.find().observeChanges({
    changed(_id) {
      addKeysToFastlyPurgingQueue([_id]);
    },
    removed(_id) {
      addKeysToFastlyPurgingQueue([_id]);
    },
  });
});
