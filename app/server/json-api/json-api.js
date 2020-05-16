// @flow

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
import { ApiRequests } from '/both/api/api-requests/api-requests';
import { Random } from 'meteor/random';
import { hashIp } from '../hash-ip';

function splitPath(path: string, separator: string = '/') {
  // remove extension
  const pathWithoutExtension = path.replace(/\.[^./]+$/, '');

  // split by separator…
  const split = pathWithoutExtension.split(separator);

  // and recombine into components
  const components = split.reduce((p: string[], v: string, i: number) => {
    const prevIndex = p.length - 1;
    const nextValue = prevIndex >= 0 ? `${p[prevIndex]}${separator}${v}` : v;
    // no empty prefixes
    if (nextValue.length > 1) {
      p.push(nextValue);
    }
    return p;
  }, []);

  return components;
}


function handleJSONRequest(req, res, next) {
  const startTimestamp = Date.now();
  const { pathname } = url.parse(req.url);
  const [collectionName, _id] = pathname.replace(/^\//, '')
    .replace(/.json($|\?)/, '')
    .split('/');
  const requestId = Random.id(5);

  let appId = null;
  let app = null;
  let user = null;
  let userId = null;
  let appToken = null;
  let userToken = null;
  let dbTime = null;
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
    appToken = appAndUser.appToken;
    userToken = appAndUser.userToken;

    appId = app && app._id;
    userId = user && user._id;

    const surrogateKeys = [collectionName, appId, userId, _id];
    const options = {
      req,
      res,
      collectionName,
      collection,
      _id,
      appId,
      app,
      user,
      userId,
      surrogateKeys,
    };
    const viaAppString = app && `via app ${appId} ${app && app.name} by organization ${app && app.getOrganization().name}`;
    const asUserString = user && `as user ${getDisplayedNameForUser(user, null) || userId}`;
    console.log(
      'Request',
      requestId,
      _.compact([viaAppString, asUserString])
        .join(' '),
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
    dbTime = result.dbDuration;

    let maximalCacheTimeInSeconds = 120;
    if (typeof collection.maximalCacheTimeInSeconds !== 'undefined') {
      maximalCacheTimeInSeconds = collection.maximalCacheTimeInSeconds;
    }
    res.setHeader('Surrogate-Control', `max-age=${maximalCacheTimeInSeconds}, stale-while-revalidate=120, stale-if-error=3600`); // Interpreted by the CDN
    res.setHeader('Cache-Control', `max-age=${maximalCacheTimeInSeconds}`); // Interpreted by the browser
    res.setHeader('Surrogate-Key', uniq(surrogateKeys.filter(Boolean))
      .join(' '));
    res.setHeader('Vary', 'x-app-token, x-user-token, x-token');

    responseBody = EJSON.stringify(result.responseData);
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
  const endTimestamp = Date.now();
  const duration = (endTimestamp - startTimestamp) / 1000;

  const hashedIp = hashIp('HEX', req.connection.remoteAddress);
  try {
    ApiRequests.insert({
      appId,
      userId,
      appToken,
      userToken,
      hashedIp,
      dbTime,
      pathname,
      pathComponents: splitPath(pathname),
      method: req.method,
      responseTime: duration,
      organizationId: app ? app.organizationId : undefined,
      appName: app ? app.name : undefined,
      query: req.query,
      headers: req.headers,
      timestamp: startTimestamp,
      responseSize: responseBody ? responseBody.length : -1,
      statusCode: res.statusCode,
    });
  } catch (error) {
    console.error('Could not save API request stats:', error);
  }
  console.log(`Request ${requestId} needed ${duration}s`);
  return res.end(responseBody);
}

function acceptsJSON(format) {
  return format.toLowerCase() === 'application/json';
}

function handleFilteredJSONRequests(req, res, next) {
  function handle() {
    Fiber(() => handleJSONRequest(req, res, next))
      .run();
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
  WebApp.connectHandlers.use(bodyParser.json())
    .use(handleFilteredJSONRequests);
});
