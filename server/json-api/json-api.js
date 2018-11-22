import bodyParser from 'body-parser';
import url from 'url';
import Fiber from 'fibers';
import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import { EJSON } from 'meteor/ejson';
import uniq from 'lodash/uniq';
import { _ } from 'meteor/underscore';

import httpMethodHandlers from './http-methods';
import { collectionWithName } from './collections';
import { getAppAndUserFromRequest } from './authenticate-request';
import { setAccessControlHeaders } from './set-access-control-headers';
import { getDisplayedNameForUser } from '/both/lib/user-name';

function handleJSONRequest(req, res, next) {
  const { pathname } = url.parse(req.url);
  const [collectionName, _id] = pathname.replace(/^\//, '').replace(/.json($|\?)/, '').split('/');

  let appId = null;
  let app = null;
  let user = null;
  let userId = null;
  let responseBody = '{}';

  setAccessControlHeaders(res);

  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    const handler = httpMethodHandlers[req.method];
    if (!handler) {
      const shouldUsePatch = req.method === 'PUT' && (httpMethodHandlers.PATCH != null);
      const errorMessage = `${req.method} HTTP method not supported.`;
      throw new Meteor.Error(
        405,
        errorMessage,
        shouldUsePatch ? 'Please use PATCH instead.' : undefined,
      );
    }

    const collection = collectionWithName(collectionName);
    if (req.method === 'OPTIONS' && !!collection) {
      // We don't know if the OPTIONS request was meant for another API, so let another
      // middleware handle it
      return next();
    }

    const appAndUser = getAppAndUserFromRequest(req);
    app = appAndUser.app;
    user = appAndUser.user;
    appId = app && app._id;
    userId = user && user._id;

    const surrogateKeys = [collectionName, appId, _id];
    const options = { req, res, collectionName, collection, _id, appId, app, user, userId, surrogateKeys };
    const viaAppString = app && `via app ${appId} ${app && app.name} by organization ${app && app.getOrganization().name}`;
    const asUserString = user && `as user ${getDisplayedNameForUser(user, null) || userId}`;

    console.log(
      'Request',
      _.compact([viaAppString, asUserString]).join(' '),
      req.method,
      req.url,
      EJSON.stringify(req.body),
    );

    if (!app && !user) {
      console.warn('No app / user authorized for request.');
      // eslint-disable-next-line max-len
      throw new Meteor.Error(401, 'Not authorized.', `One of the tokens you supplied either is too old or was never valid. Log in on ${Meteor.absoluteUrl('')} and obtain a valid token in your organization's API key settings.`);
    }

    const result = handler(options);

    let maximalCacheTimeInSeconds = 120;
    if (typeof collection.maximalCacheTimeInSeconds !== 'undefined') {
      maximalCacheTimeInSeconds = collection.maximalCacheTimeInSeconds;
    }
    res.setHeader('Surrogate-Control', `max-age=${maximalCacheTimeInSeconds}, stale-while-revalidate=30, stale-if-error=3600`); // Interpreted by the CDN
    res.setHeader('Cache-Control', `max-age=${maximalCacheTimeInSeconds}`); // Interpreted by the browser
    res.setHeader('Surrogate-Key', uniq(surrogateKeys).join(' '));


    responseBody = EJSON.stringify(result);
  } catch (error) {
    // eslint-disable-next-line no-param-reassign
    res.statusCode = (error.error === 'validation-error') ? 422 : (error.error || 500);
    console.log(
      'Error while handling', req.url,
      ` requested by app id ${appId} (${app && app.name}):`,
      error,
      error.stack,
    );
    const responseData = { error: _.pick(error, 'reason', 'details') };
    responseData.error.reason = responseData.error.reason || 'Internal server error';
    responseBody = JSON.stringify(responseData);
  }

  return res.end(responseBody);
}

function acceptsJSON(format) {
  return format.toLowerCase() === 'application/json';
}

function handleFilteredJSONRequests(req, res, next) {
  function handle() {
    Fiber(() => handleJSONRequest(req, res, next)).run();
  }

  if (req.method === 'OPTIONS') {
    return handle();
  }

  const acceptedFormats = (req.headers.accept || '')
    .split(';')
    .map(format => format.trim());

  if (!(req.url.match(/.json(\?|$)/) || _.any(acceptedFormats, acceptsJSON))) {
    return next();
  }

  return handle();
}

Meteor.startup(() => {
  WebApp.connectHandlers.use(bodyParser.json()).use(handleFilteredJSONRequests);
});
