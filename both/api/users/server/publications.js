import { Meteor } from 'meteor/meteor';
import { isAdmin } from '/both/lib/is-admin';

Meteor.publish('users.needApproval', function publish() {
  this.autorun(() => {
    if (!isAdmin(this.userId)) {
      return [];
    }

    // Only users with `isApproved: false` are supposed to be approvable.
    return Meteor.users.find({
      isApproved: false,
    });
  });
});
