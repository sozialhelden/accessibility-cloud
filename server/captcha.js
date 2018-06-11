import Fiber from 'fibers';
import url from 'url';
import { WebApp } from 'meteor/webapp';
import SvgCaptcha from 'svg-captcha';
import JSSHA from 'jssha';

import { Captchas } from '../both/api/captchas/captchas';
import { PlaceInfos } from '../both/api/place-infos/place-infos';

const path = '/captcha.svg';

function respond(res, content) {
  res.end(content);
}

function respondWithSvg(res, code, content) {
  res.writeHead(code, { 'Content-Type': 'image/svg+xml' });
  respond(res, content);
}

function respondWithError(res, code, reason) {
  console.error('Responding with error', code, reason);
  res.writeHead(code, { 'Content-Type': 'application/json' });
  respond(res, JSON.stringify({ error: { reason } }));
}

// use non nsa sha3 family
const shaHasher = new JSSHA('SHA3-256', 'TEXT');

function handleCaptchaRequest(req, res) {
  try {
    const query = url.parse(req.url, true).query;

    if (req.method !== 'GET') {
      respondWithError(res, 405, 'This endpoint only accepts GET requests');
      return;
    }

    const placeId = query.placeId;
    if (!placeId) {
      respondWithError(res, 422, 'Please supply a `placeId` query string parameter.');
      return;
    }

    const place = PlaceInfos.findOne(placeId);
    if (!place) {
      respondWithError(res, 404, `Place with id ${placeId} not found.`);
      return;
    }

    const appToken = req.headers['x-app-token'] || req.headers['x-user-token'] || query.appToken || query.userToken;

    const captcha = SvgCaptcha.create({
      size: 6,
      noise: 2,
      color: true,
    });

    const hashedIp = shaHasher.getHash('HEX', req.connection.remoteAddress);

    console.log('Requested captcha', captcha.text);
    const attributes = {
      hashedIp,
      objectId: placeId,
      solution: captcha.text,
      appToken,
      timestamp: new Date(),
    };
    Captchas.insert(attributes);
    respondWithSvg(res, 200, captcha.data);
  } catch (error) {
    respondWithError(res, 500, 'Internal server error while handling upload request.');
    console.error('Internal error was:', error, error.stack);
  }
}

WebApp.connectHandlers.use(path, (req, res, next) => {
  Fiber(() => handleCaptchaRequest(req, res, next)).run();
});
