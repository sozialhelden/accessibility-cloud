import createProgressStream from 'progress-stream';
import { Throttle } from 'stream-throttle';
import request from 'request';
import { check, Match } from 'meteor/check';
import streamLength from 'stream-length';

export class HTTPDownload {
  constructor({ headers, sourceUrl, onProgress, onDebugInfo, bytesPerSecond }) {
    check(sourceUrl, String);
    check(onProgress, Function);
    check(onDebugInfo, Function);
    check(bytesPerSecond, Match.Optional(Number));
    check(headers, Match.Optional(Match.ObjectIncluding({})));

    const headersWithUserAgent = Object.assign({
      'User-Agent': 'accessibility.cloud Bot/1.0',
    }, headers);

    this.stream = request(sourceUrl, { headers: headersWithUserAgent });

    const options = {
      time: 1000,
      speed: 1000,
    };
    const progressStream = createProgressStream(options, onProgress);

    streamLength(this.stream)
      .then(length => {
        progressStream.setLength(length);
        this.stream.emit('length', length);
      })
      .catch(error => console.log('Warning: Could not find stream length:', error));

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

    // Throttle stream when data processing afterwards might overload otherwise
    if (bytesPerSecond) {
      this.stream = this.stream.pipe(new Throttle({ rate: bytesPerSecond }));
    }

    this.stream = this.stream.pipe(progressStream);
  }

  static getParameterSchema() {
    return { sourceUrl: { regEx: SimpleSchema.RegEx.Url } };
  }
}
