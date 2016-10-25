import { Meteor } from 'meteor/meteor';

Meteor.publish(null, function currentUserInfo() {
  if (this.userId) {
    return Meteor.users.find(
      { _id: this.userId },
      {
        fields: { isAdmin: 1 },
      },
    );
  }
  this.ready();
  return [];
});
