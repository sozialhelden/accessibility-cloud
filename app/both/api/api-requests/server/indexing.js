import { Meteor } from 'meteor/meteor';
import { ApiRequests } from '../api-requests';

Meteor.startup(() => {
  ApiRequests._ensureIndex({ appToken: 1, timestamp: 1 });

  const oneWeek = 60 * 60 * 24 * 7;
  ApiRequests._ensureIndex({ timestamp: 1 }, { expireAfterSeconds: oneWeek });

  ApiRequests.deny({
    insert() {
      return true;
    },
    update() {
      return true;
    },
    remove() {
      return true;
    },
  });
});
