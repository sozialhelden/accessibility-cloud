const { Transform } = Npm.require('zstreams');
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export class ParseJSONChunks {
  constructor() {
    this.stream = new Transform({
      writableObjectMode: true,
      readableObjectMode: true,
      transform(chunk, encoding, callback) {
        callback(null, JSON.parse(chunk));
      },
    })
    .setEncoding('utf8');
  }

  static getParameterSchema() {
    return new SimpleSchema({});
  }
}
