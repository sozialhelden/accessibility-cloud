import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export function isApproved(userId) {
  check(userId, String);
  return Meteor.users.findOne(userId).isApproved;
}
