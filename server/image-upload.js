import Fiber from 'fibers';
import url from 'url';

import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';

import { Images } from '../both/api/images/images';
import { allowedMimeTypes, createImageFromStream } from '../both/api/images/server/save-upload-from-stream';
import { PlaceInfos } from '../both/api/place-infos/place-infos';
import { Captchas, CaptchaLifetime } from '../both/api/captchas/captchas';
import { shouldThrottleByIp } from './throttle-api';
import { hashIp } from './hash-ip';

import { isRequestAuthorized } from './json-api/authenticate-request';
import { setAccessControlHeaders } from './json-api/set-access-control-headers';

function respond(res, code, json) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(json));
}

function respondWithError(res, code, reason) {
  console.error('Responding with error', code, reason);
  respond(res, code, { error: { reason } });
}


const ignoreRelatedObject = { place: true };


function createImageUploadHandler({ path, queryParam, context, collection }) {
  function handleUploadRequest(req, res) {
    try {
      setAccessControlHeaders(res, ['OPTIONS', 'POST']);
      const query = url.parse(req.url, true).query;

      const isAuthorized = isRequestAuthorized(req);
      if (!isAuthorized) {
        respondWithError(res, 401, 'Invalid token.');
      }

      const hashedIp = hashIp('HEX', req.connection.remoteAddress);

      if (req.method === 'OPTIONS') {
        res.end();
        return;
      }

      if (req.method !== 'POST') {
        respondWithError(res, 405, 'This endpoint only accepts POST and OPTIONS requests');
        return;
      }

      const mimeType = req.headers['content-type'] || '';

      if (!allowedMimeTypes.includes(mimeType.toLowerCase())) {
        respondWithError(res, 415, `The given mime type ${mimeType} is not supported by this endpoint.`);
        return;
      }

      const appToken = req.headers['x-app-token'] || req.headers['x-user-token'] || query.appToken || query.userToken;

      const objectId = query[queryParam];
      if (!objectId) {
        respondWithError(res, 422, `Please supply a \`${queryParam}\` query string parameter.`);
        return;
      }

      const throttled = shouldThrottleByIp(Images, hashedIp);
      if (throttled) {
        respondWithError(res, 429, 'Too many requests');
        return;
      }

      if (!ignoreRelatedObject[context]) {
        const relatedObject = collection.findOne(objectId);
        if (!relatedObject) {
          respondWithError(res, 404, `Object with id ${objectId} not found.`);
          return;
        }
      }

      const solution = query.captcha;
      const outdatedDuration = new Date(new Date().getTime() - (CaptchaLifetime));
      const captchaQuery = {
        hashedIp,
        appToken,
        solution,
        timestamp: { $gte: outdatedDuration },
      };
      const captchas = Captchas.find(captchaQuery, { limit: 1, fields: {} }).fetch();
      if (captchas.length < 1) {
        respondWithError(res, 404, 'No captcha found.');
        return;
      }

      const usedCaptcha = captchas[0]._id;
      console.log(`Uploading image for place ${objectId} using captcha ${usedCaptcha}`, req.headers);

      createImageFromStream(
        req,
        {
          mimeType,
          context,
          objectId,
          appToken,
          hashedIp,
        },
        (error) => {
          if (!error) {
            respond(res, 200, { error: null, success: true });
            return;
          }
          if (error instanceof Meteor.Error) {
            respond(res, error.error || 500, error);
          } else {
            respondWithError(res, 500, 'Internal server error while uploading image.');
            console.error('Internal error was:', error, error.stack);
          }
        },
      );
    } catch (error) {
      respondWithError(res, 500, 'Internal server error while handling upload request.');
      console.error('Internal error was:', error, error.stack);
    }
  }

  WebApp.connectHandlers.use(path, (req, res, next) => {
    Fiber(() => handleUploadRequest(req, res, next)).run();
  });
}

createImageUploadHandler({
  path: '/image-upload',
  queryParam: 'placeId',
  context: 'place',
  collection: PlaceInfos,
});
