import JSONStream from 'JSONStream';
import { check } from 'meteor/check';

export class ParseJSONStream {
  constructor({ path }) {
    check(path, String);
    this.stream = JSONStream.parse(path);
  }

  static getParameterSchema() {
    return {

    };
  }
}
