import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const { Transform } = Npm.require('zstreams');

export default class ParseJSONChunks {
  constructor() {
    this.stream = new Transform({
      // writableObjectMode: true,
      readableObjectMode: true,
      transform(chunk, encoding, callback) {
        callback(null, JSON.parse(chunk));
      },
    });

    this.stream.unitName = 'objects';
  }

  dispose() {
    delete this.stream;
  }

  static getParameterSchema() {
    return new SimpleSchema({});
  }
}
