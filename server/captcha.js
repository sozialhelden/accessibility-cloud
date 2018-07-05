import Fiber from 'fibers';
import url from 'url';
import { WebApp } from 'meteor/webapp';
import SvgCaptcha from 'svg-captcha';

import { Captchas, CaptchaLifetime } from '../both/api/captchas/captchas';
import { shouldThrottleByIp } from './throttle-api';
import { hashIp } from './hash-ip';
import { isRequestAuthorized } from './json-api/authenticate-request';
import { setAccessControlHeaders } from './json-api/set-access-control-headers';

const path = '/captcha.svg';

function respond(res, content) {
  res.end(content);
}

function respondWithSvg(res, code, content) {
  res.writeHead(code, {
    'Content-Type': 'image/svg+xml',
    'Cache-Control': 'private, must-revalidate, max-age=300',
    Expires: new Date(new Date().getTime() + CaptchaLifetime).toUTCString(),
  });
  respond(res, content);
}

function respondWithError(res, code, reason) {
  console.error('Responding with error', code, reason);
  res.writeHead(code, { 'Content-Type': 'application/json' });
  respond(res, JSON.stringify({ error: { reason } }));
}

function handleCaptchaRequest(req, res) {
  try {
    setAccessControlHeaders(res, ['GET']);
    const query = url.parse(req.url, true).query;

    if (req.method !== 'GET') {
      respondWithError(res, 405, 'This endpoint only accepts GET requests');
      return;
    }

    const isAuthorized = isRequestAuthorized(req);
    if (!isAuthorized) {
      respondWithError(res, 401, 'Invalid token.');
    }

    const hashedIp = hashIp('HEX', req.connection.remoteAddress);
    const throttled = shouldThrottleByIp(Captchas, hashedIp);
    if (throttled) {
      respondWithError(res, 429, 'Too many requests');
      return;
    }

    const appToken = req.headers['x-app-token'] || req.headers['x-user-token'] || query.appToken || query.userToken;

    const captcha = SvgCaptcha.create({
      size: 6,
      noise: 2,
      color: true,
    });

    console.log('Requested captcha', captcha.text);
    const attributes = {
      hashedIp,
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
