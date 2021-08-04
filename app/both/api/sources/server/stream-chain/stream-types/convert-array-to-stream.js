import util from 'util';
import { get, isArray } from 'lodash';
import { check, Match } from 'meteor/check';

const { Transform } = Npm.require('zstreams');

export default class ConvertArrayToStream {
  constructor({ path, through }) {
    check(path, Match.Optional(String));
    check(through, Match.Optional(Boolean));
    this.stream = new Transform({
      writableObjectMode: true,
      readableObjectMode: true,
      transform(chunk, encoding, callback) {
        const array = typeof path === 'string' ? get(chunk, path) : chunk;
        if (!isArray(array)) {
          callback(
            new Error(`Object at path '${path}' is no array, but ${array.prototype}`),
          );
          return;
        }
        setImmediate(() => {
          for (const value of array) {
            this.push(through === true ? { chunk, value } : value);
          }
          callback();
        });
      },
    });
    this.stream.unitName = 'array elements';
  }

  dispose() {
    delete this.stream;
  }

  static getParameterSchema() {
    return {};
  }
}
