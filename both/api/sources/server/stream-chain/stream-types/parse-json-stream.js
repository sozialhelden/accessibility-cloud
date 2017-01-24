import JSONStream from 'JSONStream';
import { check } from 'meteor/check';
const { Transform } = Npm.require('zstreams');


export class ParseJSONStream {
  constructor({ path, lengthPath }) {
    check(path, String);

    this.jsonStream = JSONStream.parse(path);

    let lengthRecognized = false;
    this.lengthStream = JSONStream.parse(lengthPath);
    this.lengthListener = length => {
      this.stream.emit('length', length);
      console.log('Recognized stream length', length);
      lengthRecognized = true;
      this.lengthStream.destroy();
    };
    this.lengthStream.on('data', this.lengthListener);

    this.stream = new Transform({
      writableObjectMode: false,
      readableObjectMode: true,

      transform: (chunk, encoding, callback) => {
        const string = chunk.toString();
        this.jsonStream.write(string);
        if (lengthPath && !lengthRecognized) {
          this.lengthStream.write(string);
        }
        callback();
      },
    });

    this.dataListener = data => this.stream.push(data);
    this.jsonStream.on('data', this.dataListener);
  }

  dispose() {
    this.jsonStream.removeListener('data', this.dataListener);
    delete this.dataListener;
    this.jsonStream.destroy();
    delete this.jsonStream;
    this.lengthStream.removeListener('length', this.lengthListener);
    delete this.lengthListener;
    this.lengthStream.destroy();
    delete this.lengthStream;
    delete this.stream;
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
