import createProgressStream from 'progress-stream';
import request from 'request';
import { check } from 'meteor/check';
import streamLength from 'stream-length';

export class HTTPDownload {
  constructor({ sourceUrl, onProgress, onDebugInfo }) {
    check(sourceUrl, String);
    check(onProgress, Function);
    check(onDebugInfo, Function);

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


    this.stream = this.stream.pipe(progressStream);
  }
}
