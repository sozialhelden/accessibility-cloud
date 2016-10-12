import { Meteor } from 'meteor/meteor';

// Calls a given function with one parameter, options, simulating it is called as the given
// user. Inside the function, Meteor.user() and Meteor.userId() will return the given user.
// This comes in handy when calling registered Meteor methods with external authentication.

export function callFunctionAsUser(handler, options, user) {
  const userId = user && user._id;
  Object.assign(options, { user, userId });
  const oldUserIdFn = Meteor.userId;
  const oldUserFn = Meteor.user;
  Meteor.userId = () => userId;
  Meteor.user = () => user;
  const result = handler.call(undefined, options);
  Meteor.userId = oldUserIdFn;
  Meteor.user = oldUserFn;
  return result;
}
