import request from 'request';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { check, Match } from 'meteor/check';
import { generateDynamicUrl } from '../generate-dynamic-url';

const { Transform } = Npm.require('zstreams');

export class MultiHTTPDownload {
  constructor({
    headers,
    maximalErrorRatio = 0.25,
    allowedStatusCodes = [200],
    sourceUrl,
    onDebugInfo,
    bytesPerSecond,
    lastSuccessfulImport,
    gzip = true,
    maximalConcurrency = 3,
  }) {
    check(sourceUrl, String);

    check(onDebugInfo, Function);
    check(bytesPerSecond, Match.Optional(Number));
    check(headers, Match.Optional(Match.ObjectIncluding({})));
    check(allowedStatusCodes, [Number]);
    check(maximalErrorRatio, Number);
    check(maximalConcurrency, Number);

    const headersWithUserAgent = Object.assign({
      'User-Agent': 'accessibility.cloud Bot/1.0',
    }, headers);

    let loggedFirstRequest = false;
    let requestCount = 0;
    let errorCount = 0;
    let lastErroneousResponse = null;

    this.stream = new Transform({
      writableObjectMode: true,
      readableObjectMode: true,
      highWaterMark: Math.max(0, Math.min(maximalConcurrency, 10)),
      transform(chunk, encoding, callback) {
        const url = generateDynamicUrl({
          lastSuccessfulImport,
          sourceUrl: sourceUrl.replace(/\{\{inputData\}\}/, chunk)
        });
        const options = {
          gzip,
          allowedStatusCodes,
          url,
          method: 'GET',
          headers: headersWithUserAgent,
        };

        requestCount++;
        const req = request(options, (error, response, body) => {
          if (error) {
            this.emit('error', error);
            return;
          }
          if (!allowedStatusCodes.includes(response.statusCode)) {
            errorCount++;
            lastErroneousResponse = response;
            if (errorCount / requestCount > maximalErrorRatio) {
              this.emit('error', new Error('Error rate too high.'));
              return;
            }
          }
          this.push(body);
          callback();
        });

        if (!loggedFirstRequest) {
          req.on('request', (request2) => {
            onDebugInfo({
              request: {
                headers: request2._headers,
                path: request2.path,
              },
            });
          })
          .once('response', response => {
            onDebugInfo({
              response: {
                statusCode: response.statusCode,
                headers: response.headers,
              },
            });
          });
          loggedFirstRequest = true;
        }
      },
      flush(callback) {
        onDebugInfo({ errorCount, lastErroneousResponse });
        callback();
      }
    });

    this.stream.unitName = 'responses';
  }

  static getParameterSchema() {
    return { sourceUrl: { regEx: SimpleSchema.RegEx.Url } };
  }
}
