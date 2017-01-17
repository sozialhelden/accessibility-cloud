import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import { getAppFromToken } from './app-token';
import { getUserIdFromToken } from './user-token';

// Returns the app/user that is authenticated for the given request, or undefined if the request
// is not (or incorrectly) authenticated.

export function getAppAndUserFromRequest(req) {
  const appToken = req.headers['x-token'] || req.headers['x-app-token'];
  const userToken = req.headers['x-user-token'];

  if (!appToken && !userToken) {
    // eslint-disable-next-line max-len
    throw new Meteor.Error(401, 'Please supply a token.', `Requests to the API must have an authentication token sent as "x-app-token" or "x-user-token" HTTP header. Log in on ${Meteor.absoluteUrl('')} and obtain a valid token in your app or organization settings.`);
  }

  if (appToken && !Match.test(appToken, String) || userToken && !Match.test(userToken, String)) {
    // eslint-disable-next-line max-len
    throw new Meteor.Error(401, 'Token must be a String.', 'You supplied a token that was no string. Please supply it as String.');
  }

  const app = getAppFromToken(appToken);
  const userId = getUserIdFromToken(userToken);
  const user = userId && Meteor.users.findOne(userId);

  return { app, user };
}
