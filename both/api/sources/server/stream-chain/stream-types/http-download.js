import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Meteor } from 'meteor/meteor';
import { Throttle } from 'stream-throttle';
import request from 'request';
import { check, Match } from 'meteor/check';
import streamLength from 'stream-length';

export class HTTPDownload {
  constructor({ headers, sourceUrl, onDebugInfo, bytesPerSecond }) {
    check(sourceUrl, String);
    check(onDebugInfo, Function);
    check(bytesPerSecond, Match.Optional(Number));
    check(headers, Match.Optional(Match.ObjectIncluding({})));

    const headersWithUserAgent = Object.assign({
      'User-Agent': 'accessibility.cloud Bot/1.0',
    }, headers);

    this.request = this.stream = request(sourceUrl, { headers: headersWithUserAgent });

    streamLength(this.stream)
      .then(length => {
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
      if (response.statusCode.toString() !== '200') {
        this.stream.emit('error', new Meteor.Error(500, 'Response had an error.'));
      }
    });

    // Throttle stream when data processing afterwards might overload otherwise
    if (bytesPerSecond) {
      this.stream = this.stream.pipe(new Throttle({ rate: bytesPerSecond }));
    }
  }

  abort() {
    this.request.abort();
  }

  static getParameterSchema() {
    return { sourceUrl: { regEx: SimpleSchema.RegEx.Url } };
  }
}
