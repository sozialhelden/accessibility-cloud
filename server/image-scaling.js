// @flow
import { WebApp } from 'meteor/webapp';
import { Random } from 'meteor/random';

import url from 'url';
import Queue from 'better-queue';
import request from 'request';
import sharp from 'sharp';


import { setAccessControlHeaders } from './json-api/set-access-control-headers';
import { buildFullImageUrl } from '../both/api/images/images';


type ImageTask = {
  imagePath: string,
  format: 'jpeg' | 'webp',
  fitw: number,
  fith: number,
  outputStream: WritableStream
}

type TaskResult = any;

type TaskCallback = ((error: ?Error, result: TaskResult) => void);

const minImageSize = 32;
const maxImageSize = 1920;

const imageProcessingHandler = (task: ImageTask, callback: TaskCallback) => {
  // console.log('started', task.imagePath, fullUrl, Date.now());

  // configure resize task
  let resizeTask = sharp()
      .resize(task.fitw, task.fith)
      .max()
      .withoutEnlargement()
      .sharpen();
  resizeTask = task.format === 'webp' ? resizeTask.webp() : resizeTask.jpeg();

  // fetch image from remote url
  const fullUrl = buildFullImageUrl({ remotePath: task.imagePath });
  const originalImageStream = request(fullUrl);

  // handle errors
  resizeTask.on('error', callback);
  originalImageStream.on('error', callback);

  // handle response
  originalImageStream.on('response', (response) => {
    const mimeType = task.format === 'webp' ? 'image/webp' : 'image/jpeg';
    task.outputStream.writeHead(200, {
      'Content-Type': mimeType,
      ETag: response.headers.ETag || task.imagePath,
      'Access-Control-Expose-Headers': 'ETag',
      'Access-Control-Max-Age': '31104000',
      'Cache-Control': 'public, max-age=31104000',
      Vary: 'X-Fastly-WebpSupport',
    });

    // console.log('response', response.headers, Date.now());

    resizeTask.on('end', function () {
      // console.log('end', Date.now());
      callback(null, 'done ');
    });
  });

  // setup pipes
  originalImageStream
    .pipe(resizeTask)
    .pipe(task.outputStream);

  return {
    cancel: () => {
      originalImageStream.destroy();
      resizeTask = null;
    },
  };
};

sharp.concurrency(3);
const imageProcessingQueue = new Queue(imageProcessingHandler, { concurrent: 3 });

function respondWithError(res, code, reason) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: { reason } }));
}

WebApp.connectHandlers.use('/images/scale/', (req: http.IncomingMessage, res: http.ServerResponse) => {
  setAccessControlHeaders(res, ['GET', 'HEAD', 'OPTIONS']);

  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    respondWithError(res, 405, 'This endpoint only accepts GET and OPTIONS requests');
    return;
  }

  const acceptHeader = req.headers.accept || '';
  // this behavior will confuse the cache, thus a custom X-Fastly-WebpSupport header is set to Vary
  const format = acceptHeader.indexOf('image/webp') >= 0 ? 'webp' : 'jpeg';

  const parsedUrl = url.parse(req.url, true);
  const imagePath = parsedUrl.pathname.substr(1);
  if (!imagePath || imagePath.length === 0) {
    respondWithError(res, 422, 'Please supply a valid image path.');
    return;
  }

  const fitw = parseInt(parsedUrl.query.fitw, 10);
  if (!fitw || fitw < minImageSize || fitw > maxImageSize) {
    respondWithError(res, 422, `Please supply a valid \`fitw\` query string parameter (between ${minImageSize} and ${maxImageSize}).`);
    return;
  }

  const fith = parseInt(parsedUrl.query.fith, 10);
  if (!fith || fith < minImageSize || fith > maxImageSize) {
    respondWithError(res, 422, `Please supply a valid \`fith\` query string parameter (between  ${minImageSize} and ${maxImageSize}).`);
    return;
  }

  const id = Random.id();
  const imageTaskConfig: ImageTask = {
    imagePath,
    fitw,
    fith,
    id,
    format,
    outputStream: res,
  };

  // custom timeout, as better-queue does not call cancel on timeout, so there is no way to abort
  let timeoutHandle = null;
  imageProcessingQueue.push(
    imageTaskConfig,
    (err) => {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
        timeoutHandle = null;
      }
      if (err) {
        console.error('failed in image conversion with', err);
        res.end();
        return;
      }
      res.end();
    },
  );

  timeoutHandle = setTimeout(() => imageProcessingQueue.cancel(id), 5000);
});
