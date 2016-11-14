import JSONStream from 'JSONStream';
import { check } from 'meteor/check';
import { ObjectProgressStream } from '../object-progress-stream';

export class ParseJSONStream {
  constructor({ path, onProgress }) {
    check(path, String);
    this.stream = JSONStream.parse(path);
    this.progressStream = new ObjectProgressStream(this.stream, onProgress);
  }

  static getParameterSchema() {
    return {
      path: {
        optional: true,
        type: String,
      },
    };
  }
}
