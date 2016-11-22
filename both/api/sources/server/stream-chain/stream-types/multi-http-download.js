import EventStream from 'event-stream';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { check, Match } from 'meteor/check';
const zstreams = Npm.require('zstreams');

export class MultiHTTPDownload {
  constructor({ headers, sourceUrl, onDebugInfo, bytesPerSecond }) {
    check(sourceUrl, String);

    check(onDebugInfo, Function);
    check(bytesPerSecond, Match.Optional(Number));
    check(headers, Match.Optional(Match.ObjectIncluding({})));

    const headersWithUserAgent = Object.assign({
      'User-Agent': 'accessibility.cloud Bot/1.0',
    }, headers);

    let firstInputObject;

    // eslint-disable-next-line array-callback-return
    this.stream = EventStream.map((data, callback) => {
      if (!firstInputObject) {
        firstInputObject = data;
        onDebugInfo({ firstInputObject: JSON.stringify(firstInputObject) });
      }

      const options = {
        url: sourceUrl.replace(/\{\{inputData\}\}/, data),
        method: 'GET',
        headers: headersWithUserAgent,
        allowedStatusCodes: [200],
      };
      this.stream = zstreams.request(options, (error, response, body) => {
        callback(error, body);
      })
      .on('request', (req) => {
        onDebugInfo({
          request: {
            headers: req._headers,
            path: req.path,
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
    });
  }

  static getParameterSchema() {
    return { sourceUrl: { regEx: SimpleSchema.RegEx.Url } };
  }
}
