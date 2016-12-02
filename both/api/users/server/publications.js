import { Meteor } from 'meteor/meteor';
import { isAdmin } from '/both/lib/is-admin';

Meteor.publish('users.needApproval', function publish() {
  this.autorun(() => {
    if (!isAdmin(this.userId)) {
      return [];
    }
    return Meteor.users.find({ $or: [
      { isApproved: { $exists: false } },
      { isApproved: false },
    ] });
  });
});
