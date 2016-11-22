import JSONStream from 'JSONStream';
import { check } from 'meteor/check';
const { Transform } = Npm.require('zstreams');


export class ParseJSONStream {
  constructor({ path, lengthPath }) {
    check(path, String);

    const jsonStream = JSONStream.parse(path);

    let lengthRecognized = false;
    const lengthStream = JSONStream.parse(lengthPath);
    lengthStream.on('data', length => {
      this.stream.emit('length', length);
      console.log('Recognized stream length', length);
      lengthRecognized = true;
      lengthStream.destroy();
    });

    this.stream = new Transform({
      writableObjectMode: false,
      readableObjectMode: true,

      transform(chunk, encoding, callback) {
        const string = chunk.toString();
        jsonStream.write(string);
        if (lengthPath && !lengthRecognized) {
          lengthStream.write(string);
        }
        callback();
      },
    });

    jsonStream.on('data', data => {
      this.stream.push(data);
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
