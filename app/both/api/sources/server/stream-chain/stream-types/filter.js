import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import { check, Match } from 'meteor/check';


const { Transform } = Npm.require('zstreams');

export default class Filter {

  constructor({ path, expectedValue, negate, onDebugInfo }) {
    check(path, String);
    check(negate, Match.Optional(Boolean));

    let numberOfMatchingDocuments = 0;

    this.stream = new Transform({
      writableObjectMode: true,
      readableObjectMode: true,
      transform(chunk, encoding, callback) {
        const value = get(chunk, path);
        const valueIsTrueish = !!value;
        const valueIsAsExpected = expectedValue ? isEqual(expectedValue, value) : valueIsTrueish;
        if (negate ? !valueIsAsExpected : valueIsAsExpected) {
          numberOfMatchingDocuments += 1;
          callback(null, chunk);
        } else {
          callback();
        }
      },
      flush(callback) {
        onDebugInfo({
          numberOfMatchingDocuments,
        });
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
