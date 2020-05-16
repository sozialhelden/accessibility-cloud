import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export function isApproved(userId) {
  check(userId, String);
  const user = Meteor.users.findOne(userId);
  return user && user.isApproved;
}
