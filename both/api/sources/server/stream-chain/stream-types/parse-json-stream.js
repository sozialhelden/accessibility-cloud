import JSONStream from 'JSONStream';
import { check } from 'meteor/check';

export class ParseJSONStream {
  constructor({ path }) {
    check(path, String);
    this.stream = JSONStream.parse(path);
    this.stream.on('data', console.log);
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
