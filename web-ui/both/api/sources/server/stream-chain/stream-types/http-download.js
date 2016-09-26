import createProgressStream from 'progress-stream';
import request from 'request';
import { check } from 'meteor/check';

export class HTTPDownload {
  constructor({ sourceUrl, onProgress, onDebugInfo }) {
    check(sourceUrl, String);
    this.stream = request(sourceUrl);
    if (onProgress) {
      const options = {
        time: 1000,
        speed: 1000,
      };
      const progressStream = createProgressStream(options, onProgress);
      this.stream = this.stream.pipe(progressStream);
    }
    if (onDebugInfo) {
      this.stream.on('response', response => {
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
    }
  }
}
