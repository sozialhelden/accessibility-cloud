import request from 'request';
import { Throttle } from 'stream-throttle';
import streamLength from 'stream-length';
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { _ } from 'meteor/underscore';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { generateDynamicUrl } from '../generate-dynamic-url';

export class HTTPDownload {
  constructor({
    headers,
    sourceUrl,
    lastSuccessfulImport,
    onDebugInfo,
    allowedStatusCodes = [200],
    gzip = true,
    bytesPerSecond,
  }) {
    check(sourceUrl, String);
    check(allowedStatusCodes, [Number]);
    check(onDebugInfo, Function);
    check(bytesPerSecond, Match.Optional(Number));
    check(headers, Match.Optional(Match.ObjectIncluding({})));

    const headersWithUserAgent = Object.assign({
      'User-Agent': 'accessibility.cloud Bot/1.0',
    }, headers);

    const url = generateDynamicUrl({ lastSuccessfulImport, sourceUrl });
    this.request = this.stream = request(url, { gzip, headers: headersWithUserAgent });

    streamLength(this.stream)
      .then(length => {
        this.stream.emit('length', length);
      })
      .catch(error => console.log('Warning: Could not find stream length:', error));

    this.stream.on('request', req => {
      // console.log('Making request', req);
      onDebugInfo({
        request: {
          sourceUrl: this.request.uri.href,
          headers: _.flatten(_.pairs(req._headers)),
          path: req.path,
        },
      });
    });

    this.stream.once('response', response => {
      onDebugInfo({
        response: {
          statusCode: response.statusCode,
          headers: response.rawHeaders,
        },
      });
      if (!allowedStatusCodes.includes(response.statusCode)) {
        onDebugInfo({
          'response.body': response.body,
        });
        this.stream.emit('error', new Meteor.Error(500, 'Response had an error.'));
      }
      if (['gzip', 'deflate'].includes(response.headers['content-encoding'])) {
        if (!response.headers['content-length']) {
          const lengthRequest = request(sourceUrl, { gzip: false, headers: headersWithUserAgent })
            .on('response', lengthResponse => {
              console.log('Got length response', lengthResponse);
              this.stream.emit('length', lengthResponse.headers['content-length']);
              lengthRequest.abort();
            });
        }
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
