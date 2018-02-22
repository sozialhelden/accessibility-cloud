import url from 'url';
import Fiber from 'fibers';
import pick from 'lodash/pick';
import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import { PlaceInfos } from '../../both/api/place-infos/place-infos';
import { setAccessControlHeaders } from './set-access-control-headers';

function handleJSONRequest(req, res, next) {
  const { pathname } = url.parse(req.url);
  if (!pathname.match(/^\/health-check/)) {
    return next();
  }

  setAccessControlHeaders(res);
  res.setHeader('Content-Type', 'application/json');
  let responseData = {};

  try {
    if (req.method !== 'GET') {
      throw new Meteor.Error(405, `${req.method} HTTP method not supported for this URL.`);
    }
    console.log('Answering health check...');
    const startTime = Date.now();
    PlaceInfos.findOne({}, { transform: null, maxTimeMs: 10000 });
    responseData = { databaseRequestPingTimeInMs: Date.now() - startTime };
  } catch (error) {
    // eslint-disable-next-line no-param-reassign
    res.statusCode = error.code || 500;
    console.log('Error while doing health check:', error, error.stack);
    responseData = { error: pick(error, 'reason', 'details') };
    responseData.error.reason = responseData.error.reason || 'Internal error';
  }
  return res.end(JSON.stringify(responseData));
}

function handleFilteredJSONRequests(req, res, next) {
  Fiber(() => handleJSONRequest(req, res, next)).run();
}

Meteor.startup(() => {
  WebApp.connectHandlers.use(handleFilteredJSONRequests);
});
