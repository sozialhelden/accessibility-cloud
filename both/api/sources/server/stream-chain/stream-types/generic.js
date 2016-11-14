import createProgressStream from 'progress-stream';
import Stream from 'stream';
import { check } from 'meteor/check';

export class Generic {
  constructor({ stream, onProgress }) {
    check(stream, Stream);
    this.stream = stream;

    if (onProgress) {
      const options = {
        time: 1000,
        speed: 1000,
      };
      const progressStream = createProgressStream(options, onProgress);
      this.stream = this.stream.pipe(progressStream);
    }
  }

  static getParameterSchema() {
    return {};
  }
}
