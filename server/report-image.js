
import url from 'url';
import { WebApp } from 'meteor/webapp';

import { Images } from '../both/api/images/images';

import { isRequestAuthorized } from './json-api/authenticate-request';
import { hashIp } from './hash-ip';
import { setAccessControlHeaders } from './json-api/set-access-control-headers';

function respond(res, code, json) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(json));
}

function respondWithError(res, code, reason) {
  console.error('Responding with error', code, reason);
  respond(res, code, { error: { reason } });
}

WebApp.connectHandlers.use('/images/report', (req, res) => {
  setAccessControlHeaders(res, ['POST', 'OPTIONS']);

  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    respondWithError(res, 405, 'This endpoint only accepts POST and OPTIONS requests');
    return;
  }

  const query = url.parse(req.url, true).query;

  const hashedIp = hashIp('HEX', req.connection.remoteAddress);

  const isAuthorized = isRequestAuthorized(req);
  if (!isAuthorized) {
    respondWithError(res, 401, 'Invalid token.');
  }

  const imageId = query.imageId;
  if (!imageId) {
    respondWithError(res, 422, 'Please supply a `imageId` query string parameter.');
    return;
  }

  const reason = query.reason;
  if (!reason) {
    respondWithError(res, 422, 'Please supply a `reason` query string parameter.');
    return;
  }

  const place = Images.findOne(imageId);
  if (!place) {
    respondWithError(res, 404, `Image with id ${imageId} not found.`);
    return;
  }

  Images.update({ _id: imageId }, {
    $set: {
      moderationRequired: true,
    },
    $push: {
      reports: {
        hashedIp,
        reason,
        timestamp: new Date(),
      },
    },
  });

  respond(res, 200, { success: true });
});
