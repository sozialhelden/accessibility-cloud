import zstreams from 'zstreams';
import { check, Match } from 'meteor/check';
import SimpleSchema from 'meteor/aldeed:simple-schema';

export class HTTPDownload {
  constructor({ headers, sourceUrl, onDebugInfo, bytesPerSecond }) {
    check(sourceUrl, String);
    check(onDebugInfo, Function);
    check(bytesPerSecond, Match.Optional(Number));
    check(headers, Match.Optional(Match.ObjectIncluding({})));

    const headersWithUserAgent = Object.assign({
      'User-Agent': 'accessibility.cloud Bot/1.0',
    }, headers);

    this.stream = zstreams.request(sourceUrl, { headers: headersWithUserAgent });


    this.stream.on('request', req => {
      console.log(req);
      onDebugInfo({
        request: {
          headers: req._headers,
          path: req.path,
        },
      });
    });

    this.stream.once('response', response => {
      onDebugInfo({
        response: {
          statusCode: response.statusCode,
          headers: response.headers,
        },
      });
    });

  }

  static getParameterSchema() {
    return { sourceUrl: { regEx: SimpleSchema.RegEx.Url } };
  }
}
