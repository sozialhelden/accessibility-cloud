import request from 'request';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { check, Match } from 'meteor/check';
import { generateDynamicUrl } from '../generate-dynamic-url';
import generateRequestSignature from './generateRequestSignature';

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
  }) {
    check(sourceUrl, String);

    check(onDebugInfo, Function);
    check(bytesPerSecond, Match.Optional(Number));
    check(headers, Match.Optional(Match.ObjectIncluding({})));
    check(allowedStatusCodes, [Number]);
    check(includedStatusCodes, [Number]);
    check(maximalErrorRatio, Number);
    check(maximalConcurrency, Number);

    const extendedHeaders = Object.assign({
      'User-Agent': 'accessibility.cloud Bot/1.0',
    }, headers);

    if (signature) {
      extendedHeaders[signature.headerName] = generateRequestSignature({ body, signature });
    }

    let loggedFirstRequest = false;
    let requestCount = 0;
    let errorCount = 0;
    let lastErroneousResponse = null;
    let lastErroneousRequest = null;

    this.stream = new Transform({
      writableObjectMode: true,
      readableObjectMode: true,
      highWaterMark: Math.max(0, Math.min(maximalConcurrency, 10)),
      transform(chunk, encoding, callback) {
        const url = generateDynamicUrl({
          lastSuccessfulImport,
          sourceUrl: sourceUrl.replace(/\{\{inputData\}\}/, chunk),
        });
        const options = {
          gzip,
          allowedStatusCodes,
          url,
          body,
          method,
          headers: extendedHeaders,
        };

        requestCount += 1;
        const req = request(options, (error, response, responseBody) => {
          if (error) {
            this.emit('error', error);
            callback(error);
            return;
          }

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
            this.push(responseBody);
          }

          callback();
        });

        if (!loggedFirstRequest) {
          req.on('request', (request2) => {
            onDebugInfo({
              request: {
                headers: req.rawHeaders,
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
        if (lastErroneousRequest && lastErroneousResponse) {
          // console.log('Got an error for', lastErroneousRequest);
          onDebugInfo({ errorCount,
            response: lastErroneousResponse && {
              statusCode: lastErroneousResponse.statusCode,
              headers: lastErroneousResponse.rawHeaders,
              body: lastErroneousResponse.body,
            },
            request: lastErroneousRequest && {
              sourceUrl: lastErroneousRequest.uri.href,
              host: lastErroneousRequest.host,
              path: lastErroneousRequest.path,
              headers: lastErroneousRequest.rawHeaders,
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
