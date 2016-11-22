import request from 'request';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { check, Match } from 'meteor/check';

const { Transform } = Npm.require('zstreams');

export class MultiHTTPDownload {
  constructor({ headers, sourceUrl, onDebugInfo, bytesPerSecond }) {
    check(sourceUrl, String);

    check(onDebugInfo, Function);
    check(bytesPerSecond, Match.Optional(Number));
    check(headers, Match.Optional(Match.ObjectIncluding({})));

    const headersWithUserAgent = Object.assign({
      'User-Agent': 'accessibility.cloud Bot/1.0',
    }, headers);

    let loggedFirstRequest = false;

    this.stream = new Transform({
      writableObjectMode: true,
      readableObjectMode: true,
      highWaterMark: 4,
      transform(chunk, encoding, callback) {
        const options = {
          url: sourceUrl.replace(/\{\{inputData\}\}/, chunk),
          method: 'GET',
          headers: headersWithUserAgent,
          allowedStatusCodes: [200],
        };

        const req = request(options, (error, response, body) => {
          callback(error, body);
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
    });

    this.stream.unitName = 'responses';
  }

  static getParameterSchema() {
    return { sourceUrl: { regEx: SimpleSchema.RegEx.Url } };
  }
}
