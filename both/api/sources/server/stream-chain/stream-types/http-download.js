import request from 'request';
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { _ } from 'meteor/underscore';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { generateDynamicUrl } from '../generate-dynamic-url';
import generateRequestSignature from './generateRequestSignature';
import asCurlString from './asCurlString';

export default class HTTPDownload {
  constructor({
    headers,
    sourceUrl,
    lastSuccessfulImport,
    onDebugInfo,
    allowedStatusCodes = [200],
    gzip = true,
    method = 'GET',
    body = '',
    signature,
  }) {
    check(sourceUrl, String);
    check(allowedStatusCodes, [Number]);
    check(onDebugInfo, Function);
    check(headers, Match.Optional(Match.ObjectIncluding({})));

    const extendedHeaders = Object.assign({
      'User-Agent': 'accessibility.cloud Bot/1.0',
    }, headers);

    if (signature) {
      extendedHeaders[signature.headerName] = generateRequestSignature({ body, signature });
    }

    const url = generateDynamicUrl({ lastSuccessfulImport, sourceUrl });
    const options = { gzip, headers: extendedHeaders, method, body };
    this.request = this.stream = request(url, options);

    this.requestListener = req => {
      onDebugInfo({
        curlString: asCurlString(Object.assign({}, { url }, options)),
        request: {
          sourceUrl: String(this.request.uri.href),
          headers: _.flatten(_.pairs(req._headers)),
          path: req.path,
        },
      });
    };
    this.stream.on('request', this.requestListener);

    this.responseListener = response => {
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

      const isCompressed = ['gzip', 'deflate'].includes(response.headers['content-encoding']);
      const length = response.headers['content-length'];
      if (length) {
        this.stream.emit('length', length, isCompressed);
      }

      if (isCompressed) {
        this.lengthRequest = request(sourceUrl, { gzip: false, headers: extendedHeaders })
          .on('response', lengthResponse => {
            if (lengthResponse.statusCode !== 200) {
              return;
            }
            const uncompressedLength = lengthResponse.headers['content-length'];
            if (uncompressedLength) {
              // console.log('Got length response', uncompressedLength);
              this.stream.emit('length', uncompressedLength, false);
            }
            this.lengthRequest.abort();
          });
      }
    };
    this.stream.once('response', this.responseListener);
  }

  abort() {
    if (!this.request) return;
    this.request.abort();
  }

  dispose() {
    this.stream.removeListener('request', this.requestListener);
    delete this.requestListener;
    this.stream.removeListener('response', this.responseListener);
    delete this.responseListener;
    if (this.lengthRequest) {
      this.lengthRequest.abort();
      delete this.lengthRequest;
    }
    delete this.stream;
    if (this.request) {
      this.request.abort();
    }
    delete this.request;
  }

  static getParameterSchema() {
    return { sourceUrl: { regEx: SimpleSchema.RegEx.Url } };
  }
}
