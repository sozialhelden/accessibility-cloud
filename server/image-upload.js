import Fiber from 'fibers';
import url from 'url';
import mime from 'mime-types';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { WebApp } from 'meteor/webapp';
import JSSHA from 'jssha';

import { Images } from '../both/api/images/images';
import { PlaceInfos } from '../both/api/place-infos/place-infos';
import { Captchas, CaptchaLifetime } from '../both/api/captchas/captchas';
import { shouldThrottleByIp } from './throttle-api';

const path = '/image-upload';

function respond(res, code, json) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(json));
}

function respondWithError(res, code, reason) {
  console.error('Responding with error', code, reason);
  respond(res, code, { error: { reason } });
}

// use non nsa sha3 family
const shaHasher = new JSSHA('SHA3-256', 'TEXT');

// TODO check actual mime type
const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/tiff', 'image/tif', 'image/gif'];

function handleUploadRequest(req, res) {
  try {
    const query = url.parse(req.url, true).query;

    const hashedIp = shaHasher.getHash('HEX', req.connection.remoteAddress);

    if (req.method !== 'POST') {
      respondWithError(res, 405, 'This endpoint only accepts POST requests');
      return;
    }

    const mimeType = req.headers['content-type'] || '';

    if (!allowedMimeTypes.includes(mimeType.toLowerCase())) {
      respondWithError(res, 415, `The given mime type ${mimeType} is not supported by this endpoint.`);
      return;
    }

    const appToken = req.headers['x-app-token'] || req.headers['x-user-token'] || query.appToken || query.userToken;

    const placeId = query.placeId;
    if (!placeId) {
      respondWithError(res, 422, 'Please supply a `placeId` query string parameter.');
      return;
    }

    const throttled = shouldThrottleByIp(Images, hashedIp);
    if (throttled) {
      respondWithError(res, 429, 'Too many requests');
      return;
    }

    const place = PlaceInfos.findOne(placeId);
    if (!place) {
      respondWithError(res, 404, `Place with id ${placeId} not found.`);
      return;
    }

    const solution = query.captcha;
    const outdatedDuration = new Date(new Date().getTime() - (CaptchaLifetime));
    const captchaQuery = {
      objectId: placeId,
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
    console.log(`Uploading image for place ${placeId} using captcha ${usedCaptcha}`);
    const suffix = mime.extension(mimeType);
    const attributes = {
      hashedIp,
      placeId,
      appToken,
      mimeType,
      remotePath: `place-images/${placeId}/${Random.secret()}${suffix ? `.${suffix}` : ''}`,
      timestamp: new Date(),
    };

    console.log('Inserting image upload', attributes);
    const _id = Images.insert(attributes);
    const image = Images.findOne(_id);

    Captchas.remove(usedCaptcha);

    image.saveUploadFromStream(req, (error) => {
      if (!error) {
        respond(res, 200, { error: null, uploadedFile: Images.findOne(_id) });
        return;
      }
      if (error instanceof Meteor.Error) {
        respond(res, 500, error);
      } else {
        respondWithError(res, 500, 'Internal server error while streaming.');
        console.error('Internal error was:', error, error.stack);
      }
    });
  } catch (error) {
    respondWithError(res, 500, 'Internal server error while handling upload request.');
    console.error('Internal error was:', error, error.stack);
  }
}

WebApp.connectHandlers.use(path, (req, res, next) => {
  Fiber(() => handleUploadRequest(req, res, next)).run();
});
