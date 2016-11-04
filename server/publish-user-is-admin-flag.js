import { Meteor } from 'meteor/meteor';

Meteor.publish('currentUserData', function currentUserInfo() {
  if (this.userId) {
    return Meteor.users.find(
      { _id: this.userId },
      {
        fields: { isAdmin: 1, isApproved: 1 },
      },
    );
  }
  this.ready();
  return [];
});
