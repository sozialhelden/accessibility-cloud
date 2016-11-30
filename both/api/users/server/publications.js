import { Meteor } from 'meteor/meteor';

Meteor.publish('users.needApproval', function () {
  if (this.userId) {
    const user = Meteor.users.findOne(this.userId);
    if (user.isAdmin) {
      return Meteor.users.find({ isApproved: null });
    }
  }
  return null;
});
