import { get, pick } from 'lodash';
import { check, Match } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import request from 'request';
import limit from 'simple-rate-limiter';
import { generateDynamicUrl } from '../generate-dynamic-url';
import ImageSize from 'image-size-stream';

import asCurlString from './asCurlString';
import generateRequestSignature from './generateRequestSignature';

const { Transform } = Npm.require('zstreams');

export const allowedMimeTypes = [
  'image/png',
  'image/jpeg',
  'image/tiff',
  'image/tif',
  'image/gif',
];


export function measureImageSize({ stream, callback }) {
  const imageSizeDetector = new ImageSize();

  imageSizeDetector.on('size', Meteor.bindEnvironment((dimensions) => {
    callback(null, dimensions);
  })).on('error', (error) => {
    callback(error);
  });

  stream.pipe(imageSizeDetector);
}


export default class MeasureRemoteImage {
  constructor({
    headers,
    maximalErrorRatio = 0.25,
    allowedStatusCodes = [200, 204],
    includedStatusCodes = [200],
    onDebugInfo,
    lastSuccessfulImport,
    gzip = true,
    body = '',
    method = 'GET',
    maximalConcurrency = 3,
    signature,
    throttle,
    sourceUrlTemplateDataProperty,
    sourceUrlProperty,
    timeout,
    source,
  }) {
    check(onDebugInfo, Function);
    check(headers, Match.Optional(Match.ObjectIncluding({})));
    check(
      throttle,
      Match.Optional(Match.ObjectIncluding({ to: Number, per: Number })),
    );
    check(allowedStatusCodes, [Number]);
    check(includedStatusCodes, [Number]);
    check(maximalErrorRatio, Number);
    check(maximalConcurrency, Number);
    check(sourceUrlTemplateDataProperty, Match.Optional(String));
    check(sourceUrlProperty, String);
    check(timeout, Match.Optional(Number));

    if (!source.allowedImportStreamUnits || !source.allowedImportStreamUnits.includes('MeasureRemoteImage')) {
      throw new Meteor.Error(401, `This data source is not authorized to use the \`MeasureRemoteImage\` stream unit. Allowed stream units: ${source.allowedImportStreamUnits}`);
    }

    const extendedHeaders = Object.assign(
      {
        'User-Agent': 'accessibility.cloud Bot/1.0',
      },
      headers,
    );

    let loggedFirstRequest = false;
    let requestCount = 0;
    let errorCount = 0;
    let lastErroneousResponse = null;
    let lastErroneousRequest = null;
    let lastResponse = null;
    let lastRequest = null;

    const throttledRequest = throttle
      ? limit(request).to(throttle.to).per(throttle.per)
      : request;

    this.stream = new Transform({
      writableObjectMode: true,
      readableObjectMode: true,
      highWaterMark: Math.max(0, Math.min(maximalConcurrency, 10)),
      transform(chunk, encoding, callback) {
        const templateData = sourceUrlTemplateDataProperty
          ? get(chunk, sourceUrlTemplateDataProperty)
          : chunk;
        const sourceUrl = get(chunk, sourceUrlProperty);
        check(sourceUrl, String);

        const url = generateDynamicUrl({
          lastSuccessfulImport,
          sourceUrl: sourceUrl.replace(/\{\{inputData\}\}/, templateData),
        });

        const bodyWithTemplateData = body.replace(/\{\{inputData\}\}/, templateData);
        Object.keys(extendedHeaders).forEach((k) => {
          extendedHeaders[k] = extendedHeaders[k].replace(
            /\{\{inputData\}\}/,
            templateData,
          );
        });
        if (signature) {
          extendedHeaders[signature.headerName] = generateRequestSignature({
            body: bodyWithTemplateData,
            signature,
          });
        }

        const options = {
          allowedStatusCodes,
          gzip,
          method,
          timeout,
          url,
          followAllRedirects: true,
          body: bodyWithTemplateData,
          headers: extendedHeaders,
        };

        requestCount += 1;
        const req = throttledRequest(options);

        try {
          req.pause();

          const uploadCallback = Meteor.bindEnvironment((error, dimensions) => {
            const measuringError = error &&
              ((typeof error === 'object') ?
                pick(error, 'message', 'code') :
                { message: error });
            console.log('Measuring finished:', error, dimensions);
            callback(null, { error: measuringError, inputData: chunk, templateData, sourceUrl, dimensions });
          });

          measureImageSize({ sourceUrl, stream: req, callback: uploadCallback });

          req.on('error', (error) => {
            this.emit('error', error);
            callback(error);
          });

          lastRequest = req;

          if (!loggedFirstRequest) {
            req
              .on('request', (request2) => {
                onDebugInfo({
                  curlString: asCurlString(options),
                  request: {
                    headers: request2.rawHeaders,
                    path: request2.path,
                  },
                });
              })
              .once('response', (response) => {
                lastResponse = response;
                onDebugInfo({
                  response: {
                    statusCode: response.statusCode,
                    headers: response.rawHeaders,
                  },
                });
                if (!allowedStatusCodes.includes(response.statusCode)) {
                  errorCount += 1;
                  lastErroneousResponse = response;
                  lastErroneousRequest = req;
                  if (errorCount / requestCount > maximalErrorRatio) {
                    const rateError = new Error('Error rate too high.');
                    this.emit('error', rateError);
                    callback(rateError);
                  }
                }
              });
            loggedFirstRequest = true;
          }
          req.resume();
        } catch (e) {
          this.emit('error', e);
          callback(e);
        }
      },
      flush(callback) {
        if (lastErroneousRequest || lastErroneousResponse) {
          // console.log('Got an error for', lastErroneousRequest);
          onDebugInfo({
            errorCount,
            lastErroneousResponse: lastErroneousResponse && {
              statusCode: lastErroneousResponse.statusCode,
              headers: lastErroneousResponse.rawHeaders,
              body: lastErroneousResponse.body,
            },
            lastErroneousRequest: lastErroneousRequest && {
              sourceUrl: lastErroneousRequest.uri,
              host: lastErroneousRequest.host,
              path: lastErroneousRequest.path,
              headers: lastErroneousRequest.rawHeaders,
            },
          });
        }
        if (lastRequest || lastResponse) {
          onDebugInfo({
            lastRequest: lastRequest && {
              sourceUrl: lastRequest.uri,
              host: lastRequest.host,
              path: lastRequest.path,
              headers: lastRequest.rawHeaders,
            },
            lastResponse: lastResponse && {
              statusCode: lastResponse.statusCode,
              headers: lastResponse.rawHeaders,
              body: lastResponse.body,
            },
          });
        }
        callback();
      },
    });

    this.stream.unitName = 'stored objects';
  }

  dispose() {
    delete this.stream;
  }

  static getParameterSchema() {
    return {};
  }
}
