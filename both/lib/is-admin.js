import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export function isAdmin(userId) {
  if (!userId) {
    return false;
  }

  check(userId, String);

  const user = Meteor.users.findOne(userId);
  return user && user.isAdmin;
}
