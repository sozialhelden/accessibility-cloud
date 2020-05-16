import request from 'request';
import limit from 'simple-rate-limiter';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { check, Match } from 'meteor/check';
import { generateDynamicUrl } from '../generate-dynamic-url';
import generateRequestSignature from './generateRequestSignature';
import asCurlString from './asCurlString';

const { Transform } = Npm.require('zstreams');

export default class MultiHTTPDownload {
  constructor({
    headers,
    maximalErrorRatio = 0.25,
    allowedStatusCodes = [200, 204],
    includedStatusCodes = [200],
    sourceUrl,
    onDebugInfo,
    bytesPerSecond,
    lastSuccessfulImport,
    gzip = true,
    body = '',
    method = 'GET',
    maximalConcurrency = 3,
    signature,
    through = false,
    throttle,
  }) {
    check(sourceUrl, String);

    check(onDebugInfo, Function);
    check(bytesPerSecond, Match.Optional(Number));
    check(headers, Match.Optional(Match.ObjectIncluding({})));
    check(throttle, Match.Optional(Match.ObjectIncluding({ to: Number, per: Number })));
    check(allowedStatusCodes, [Number]);
    check(includedStatusCodes, [Number]);
    check(maximalErrorRatio, Number);
    check(maximalConcurrency, Number);
    check(through, Boolean);

    const extendedHeaders = Object.assign({
      'User-Agent': 'accessibility.cloud Bot/1.0',
    }, headers);

    let loggedFirstRequest = false;
    let requestCount = 0;
    let errorCount = 0;
    let lastErroneousResponse = null;
    let lastErroneousRequest = null;
    let lastResponse = null;
    let lastRequest = null;

    const throttledRequest = throttle ? limit(request).to(throttle.to).per(throttle.per) : request;

    this.stream = new Transform({
      writableObjectMode: true,
      readableObjectMode: true,
      highWaterMark: Math.max(0, Math.min(maximalConcurrency, 10)),
      transform(chunk, encoding, callback) {
        const url = generateDynamicUrl({
          lastSuccessfulImport,
          sourceUrl: sourceUrl.replace(/\{\{inputData\}\}/, chunk),
        });

        const bodyWithInputData = body.replace(/\{\{inputData\}\}/, chunk);
        Object.keys(extendedHeaders).forEach((k) => {
          extendedHeaders[k] = extendedHeaders[k].replace(/\{\{inputData\}\}/, chunk);
        });
        if (signature) {
          extendedHeaders[signature.headerName] = generateRequestSignature({
            body: bodyWithInputData,
            signature,
          });
        }

        const options = {
          url,
          gzip,
          method,
          allowedStatusCodes,
          body: bodyWithInputData,
          headers: extendedHeaders,
        };

        requestCount += 1;
        const req = throttledRequest(options, (error, response, responseBody) => {
          if (error) {
            this.emit('error', error);
            callback(error);
            return;
          }

          lastResponse = response;

          if (!allowedStatusCodes.includes(response.statusCode)) {
            errorCount += 1;
            lastErroneousResponse = response;
            lastErroneousRequest = req;
            if (errorCount / requestCount > maximalErrorRatio) {
              const rateError = new Error('Error rate too high.');
              this.emit('error', rateError);
              callback(rateError);
              return;
            }
          }

          if (includedStatusCodes.includes(response.statusCode)) {
            if (through) {
              this.push({ inputData: chunk, response: responseBody });
            } else {
              this.push(responseBody);
            }
          }

          callback();
        });

        lastRequest = req;

        if (!loggedFirstRequest) {
          req.on('request', (request2) => {
            onDebugInfo({
              curlString: asCurlString(options),
              request: {
                headers: request2.rawHeaders,
                path: request2.path,
              },
            });
          })
          .once('response', (response) => {
            onDebugInfo({
              response: {
                statusCode: response.statusCode,
                headers: response.rawHeaders,
              },
            });
          });
          loggedFirstRequest = true;
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

    this.stream.unitName = 'responses';
  }

  dispose() {
    delete this.stream;
  }

  static getParameterSchema() {
    return { sourceUrl: { regEx: SimpleSchema.RegEx.Url } };
  }
}
