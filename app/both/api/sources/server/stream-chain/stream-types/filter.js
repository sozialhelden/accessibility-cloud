import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import { check, Match } from 'meteor/check';


const { Transform } = Npm.require('zstreams');

export default class Filter {
  constructor({ path, expectedValue, negate }) {
    check(path, String);
    check(expectedValue, Match.Any());
    check(negate, Match.Optional(Boolean));

    this.stream = new Transform({
      writableObjectMode: true,
      readableObjectMode: true,
      transform(chunk, encoding, callback) {
        const value = get(chunk, path);
        const valueIsTrueish = !!value;
        const valueIsAsExpected = expectedValue ? isEqual(expectedValue, value) : valueIsTrueish;
        if (negate ? !valueIsAsExpected : valueIsAsExpected) {
          callback(null, chunk);
        }
      },
      flush(callback) {
        callback();
      },
    });

    this.stream.on('pipe', (source) => {
      source.on('length', length => this.stream.emit('length', length));
    });
  }

  dispose() {
    delete this.stream;
  }

  static getParameterSchema() {
    return {};
  }
}
