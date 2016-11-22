import JSONStream from 'JSONStream';
import { check } from 'meteor/check';
const { Transform } = Npm.require('zstreams');

export class ParseJSONStream {
  constructor({ path }) {
    check(path, String);

    const jsonStream = JSONStream.parse(path);

    this.stream = new Transform({
      writableObjectMode: false,
      readableObjectMode: true,

      transform(chunk, encoding, callback) {
        jsonStream.write(chunk.toString());
        callback();
      },
    });

    jsonStream.on('data', data => {
      this.stream.push(data);
      // console.log(data);
    });
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
