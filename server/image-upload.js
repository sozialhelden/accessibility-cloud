import Fiber from 'fibers';
import url from 'url';
import mime from 'mime-types';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { WebApp } from 'meteor/webapp';
import FileType from 'stream-file-type';

import { Images } from '../both/api/images/images';
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

// TODO check actual mime type
const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/tiff', 'image/tif', 'image/gif'];

function createImageUploadHandler({ path, queryParam, context, collection }) {
  function handleUploadRequest(req, res) {
    try {
      setAccessControlHeaders(res);
      const mimeTypeDetector = new FileType();
      const query = url.parse(req.url, true).query;

      const isAuthorized = isRequestAuthorized(req);
      if (!isAuthorized) {
        respondWithError(res, 401, 'Invalid token.');
      }

      const hashedIp = hashIp('HEX', req.connection.remoteAddress);

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

      const place = collection.findOne(objectId);
      if (!place) {
        respondWithError(res, 404, `Object with id ${objectId} not found.`);
        return;
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
      const suffix = mime.extension(mimeType);
      const attributes = {
        hashedIp,
        objectId,
        appToken,
        mimeType,
        context,
        moderationRequired: true,
        isUploadedToS3: false,
        remotePath: `${context}/${objectId}/${Random.secret()}${suffix ? `.${suffix}` : ''}`,
        timestamp: new Date(),
      };

      console.log('Inserting image upload', attributes);
      const _id = Images.insert(attributes);
      const image = Images.findOne(_id);

      req.pipe(mimeTypeDetector);

      mimeTypeDetector.on('file-type', (fileType) => {
        const unsupportedFileType =
            fileType === null || !allowedMimeTypes.includes(fileType.mime.toLowerCase());
        if (unsupportedFileType) {
          respondWithError(res, 415, `Unsupported file-type detected (${fileType ? fileType.mime : 'unknown'}).`);
          req.emit('close');
          req.destroy();
        }
        const mismatchedFileType =
            mimeType && fileType && mimeType.toLowerCase() !== fileType.mime.toLowerCase();
        if (mismatchedFileType) {
          respondWithError(res, 415, `File-type (${fileType.mime}) does not match specified mime-type (${mimeType}).`);
          req.emit('close');
          req.destroy();
        }
      });

      image.saveUploadFromStream(req, (error) => {
        if (!error) {
          respond(res, 200, { error: null, success: true });
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
}

createImageUploadHandler({
  path: '/image-upload',
  queryParam: 'placeId',
  context: 'place',
  collection: PlaceInfos,
});
