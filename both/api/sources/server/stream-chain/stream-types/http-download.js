import createProgressStream from 'progress-stream';
import { Throttle } from 'stream-throttle';
import request from 'request';
import { check, Match } from 'meteor/check';
import streamLength from 'stream-length';

export class HTTPDownload {
  constructor({ sourceUrl, onProgress, onDebugInfo, bytesPerSecond }) {
    check(sourceUrl, String);
    check(onProgress, Function);
    check(onDebugInfo, Function);
    check(bytesPerSecond, Match.Optional(Number));

    this.stream = request(sourceUrl);

    const options = {
      time: 1000,
      speed: 1000,
    };
    const progressStream = createProgressStream(options, onProgress);

    streamLength(this.stream)
      .then(length => progressStream.setLength(length))
      .catch(error => console.log('Could not find stream length:', error));

    this.stream.once('response', response => {
      onDebugInfo({
        request: {
          headers: this.stream.headers,
          host: this.stream.host,
          path: this.stream.path,
        },
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
}