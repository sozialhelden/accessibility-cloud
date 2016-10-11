import bodyParser from 'body-parser';
import url from 'url';
import Fiber from 'fibers';
import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import { EJSON } from 'meteor/ejson';
import { _ } from 'meteor/underscore';

import httpMethodHandlers from './http-methods';
import { collectionWithName } from './collections';
import { callFunctionAsUser } from './call-function-as-user';
import { userFromRequest } from './user-from-request';
import { displayedUserName } from './displayed-user-name';

function handleJSONRequest(req, res) {
  const { pathname } = url.parse(req.url);
  const [collectionName, _id] = pathname.replace(/^\//, '').split('/');

  let responseData = null;
  let userId = null;
  let user = null;

  try {
    const handler = httpMethodHandlers[req.method];
    if (!handler) {
      const shouldUsePatch = req.method === 'PUT' && (httpMethodHandlers.PATCH != null);
      const errorMessage = `${req.method} HTTP method not supported.`;
      throw new Meteor.Error(
        405,
        errorMessage,
        shouldUsePatch ? 'Please use PATCH instead.' : undefined
      );
    }

    const collection = collectionWithName(collectionName);
    user = userFromRequest(req);
    userId = user && user._id;
    const options = { req, res, collectionName, collection, _id };
    console.log(
      'User',
      displayedUserName(user, userId),
      ':',
      req.method,
      req.url,
      EJSON.stringify(req.body)
    );

    responseData = callFunctionAsUser(handler, options, user);
  } catch (error) {
    // eslint-disable-next-line no-param-reassign
    res.statusCode = (error.error === 'validation-error') ? 422 : (error.error || 500);
    console.log(
      'Error while handling', req.url,
      `(requested by ${displayedUserName(user, userId)}):`,
      error,
      error.stack
    );
    responseData = _.pick(error, 'message', 'reason', 'details');
  }

  const responseBody = EJSON.stringify(responseData);
  if (responseBody && responseBody.length) {
    res.setHeader('Content-Type', 'application/json');
  }

  return res.end(responseBody);
}

function acceptsJSON(format) {
  return format.toLowerCase() === 'application/json';
}

function handleFilteredJSONRequests(req, res, next) {
  if (!req.headers.accept) {
    return next();
  }

  const acceptedFormats = req.headers.accept
    .split(';')
    .map(format => format.trim());

  if (!_.any(acceptedFormats, acceptsJSON)) {
    return next();
  }

  return Fiber(() => handleJSONRequest(req, res)).run();
}

Meteor.startup(() => {
  WebApp.connectHandlers.use(bodyParser.json()).use(handleFilteredJSONRequests);
});
