import { get, pick } from 'lodash';
import { check, Match } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import request from 'request';
import limit from 'simple-rate-limiter';
import { Stream } from 'stream';
import configureS3 from '../../../../images/server/configure-s3';
import { generateDynamicUrl } from '../generate-dynamic-url';

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

const awsS3 = configureS3();

export function uploadToS3({ remotePath, mimeType, stream, callback }) {
  check(remotePath, String);
  check(mimeType, String);

  // https://github.com/aws/aws-sdk-js/issues/2100
  // https://github.com/aws/aws-sdk-js/issues/1761
  const passThrough = new Stream.PassThrough();
  const s3Params = {
    Bucket: Meteor.settings.public.aws.s3.bucket,
    Key: remotePath,
    Body: passThrough,
    ContentType: mimeType,
    ACL: 'public-read',
    CacheControl: 'max-age=31104000',
  };

  console.log('Before starting S3 upload...', s3Params);
  awsS3.upload(s3Params, callback);
  console.log('Starting S3 upload...');
  stream.pipe(passThrough);
}


export default class UploadRemoteFileToS3 {
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
    through = false,
    throttle,
    remotePathProperty,
    mimeTypeProperty,
    isUploadedFlagProperty,
    sourceUrlTemplateDataProperty,
    sourceUrlProperty,
    timeout,
    sourceId,
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
    check(through, Boolean);
    check(sourceUrlTemplateDataProperty, Match.Optional(String));
    check(sourceUrlProperty, String);
    check(remotePathProperty, String);
    check(mimeTypeProperty, String);
    check(isUploadedFlagProperty, String);
    check(timeout, Match.Optional(Number));

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
        const remotePath = `organizations/${source.organizationId}/sources/${sourceId}/${get(chunk, remotePathProperty)}`;
        check(remotePath, String);
        const mimeType = get(chunk, mimeTypeProperty);
        check(mimeType, String);
        const isUploadedFlag = get(chunk, isUploadedFlagProperty);
        check(isUploadedFlag, Match.Optional(Boolean));

        if (isUploadedFlag) {
          callback(null, { inputData: chunk, uploadSkipped: true });
          return;
        }

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

          const uploadCallback = Meteor.bindEnvironment((error, uploadResult) => {
            const s3Error = error &&
              ((typeof error === 'object') ?
                pick(error, 'message', 'code') :
                { message: error });
            console.log('Upload to S3 finished:', error, uploadResult);
            callback(null, { s3Error, inputData: chunk, templateData, sourceUrl, uploadResult, uploadSkipped: false });
          });

          uploadToS3({ remotePath, mimeType, stream: req, callback: uploadCallback });

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
