import { Meteor } from 'meteor/meteor';

Meteor.publish(null, function currentUserInfo() {
  if (!this.userId) {
    this.ready();
    return [];
  }

  return Meteor.users.find(
    { _id: this.userId },
    {
      fields: { isAdmin: 1, isApproved: 1 },
    },
  );
});
