import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import { getAppFromToken } from './app-token';
import { getUserIdFromToken } from './user-token';

// Returns the app/user that is authenticated for the given request, or undefined if the request
// is not (or incorrectly) authenticated.

export function getAppAndUserFromRequest(req) {
  const appToken = req.headers['x-token'] || req.headers['x-app-token'] || req.query.appToken;
  const userToken = req.headers['x-user-token'] || req.query.userToken;

  if (!appToken && !userToken) {
    // eslint-disable-next-line max-len
    throw new Meteor.Error(401, 'Please supply a token.', `Requests to the API must have an authentication token as "appToken" / "userToken" query parameter. Log in on ${Meteor.absoluteUrl('')} to obtain a valid token in organization's API client settings.`);
  }

  if ((appToken && !Match.test(appToken, String)) || (userToken && !Match.test(userToken, String))) {
    // eslint-disable-next-line max-len
    throw new Meteor.Error(401, 'Token must be a String.', 'You supplied a token that was no string. Please supply it as string.');
  }

  const app = getAppFromToken(appToken);
  const userId = getUserIdFromToken(userToken);
  const user = userId && Meteor.users.findOne(userId);

  return { app, user, appToken, userToken };
}

export function isRequestAuthorized(req) {
  const auth = getAppAndUserFromRequest(req);
  return auth.app || auth.app;
}
