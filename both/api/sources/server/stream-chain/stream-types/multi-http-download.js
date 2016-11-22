import { Meteor } from 'meteor/meteor';
import request from 'request';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { check, Match } from 'meteor/check';

const { Transform } = Npm.require('zstreams');

export class MultiHTTPDownload {
  constructor({ headers, maximalErrorRatio = 0.25, allowedStatusCodes = [200], sourceUrl, onDebugInfo, bytesPerSecond, gzip = true}) {
    check(sourceUrl, String);

    check(onDebugInfo, Function);
    check(bytesPerSecond, Match.Optional(Number));
    check(headers, Match.Optional(Match.ObjectIncluding({})));
    check(allowedStatusCodes, [Number]);
    check(maximalErrorRatio, Number);

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
      highWaterMark: 3,
      transform(chunk, encoding, callback) {
        const options = {
          gzip,
          allowedStatusCodes,
          url: sourceUrl.replace(/\{\{inputData\}\}/, chunk),
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
