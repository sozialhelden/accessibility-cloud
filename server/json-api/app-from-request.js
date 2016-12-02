import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import { appFromToken } from './app-from-token';

// Returns the app that is authenticated for the given request, or undefined if the request
// is not (or incorrectly) authenticated. The app is given as Meteor.apps() document.

export function appFromRequest(req) {
  const token = req.headers['x-token'];
  if (!token) {
    // eslint-disable-next-line max-len
    throw new Meteor.Error(401, 'Please supply a token.', `Requests to the API must have an authentication token sent as "x-login-token" HTTP header. Log in on ${Meteor.absoluteUrl('')} and obtain a valid token in your app or organization settings.`);
  }

  if (!Match.test(token, String)) {
    // eslint-disable-next-line max-len
    throw new Meteor.Error(401, 'Token must be a String.', 'You supplied a token, but it was no string. Please supply it as String.');
  }

  const app = appFromToken(token);
  if (!app) {
    // eslint-disable-next-line max-len
    throw new Meteor.Error(401, 'Token not authorized.', `This token either is too old or was never valid. Log in on ${Meteor.absoluteUrl('')} and obtain a valid token in your app or organization settings.`);
  }

  return app;
}
