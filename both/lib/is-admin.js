import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export function isAdmin(userId) {
  if (!userId) {
    return false;
  }

  check(userId, String);
  return Meteor.users.findOne(userId).isAdmin;
}
