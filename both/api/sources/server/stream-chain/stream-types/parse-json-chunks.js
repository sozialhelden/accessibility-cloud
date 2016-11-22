import { SimpleSchema } from 'meteor/aldeed:simple-schema';
const { Transform } = Npm.require('zstreams');

export class ParseJSONChunks {
  constructor() {
    this.stream = new Transform({
      // writableObjectMode: true,
      readableObjectMode: true,
      transform(chunk, encoding, callback) {
        callback(null, JSON.parse(chunk));
      },
    });
  }

  static getParameterSchema() {
    return new SimpleSchema({});
  }
}
