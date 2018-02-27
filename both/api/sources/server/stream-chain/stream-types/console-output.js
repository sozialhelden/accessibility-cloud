import util from 'util';

const { Transform } = Npm.require('zstreams');

export default class ConsoleOutput {
  constructor() {
    this.stream = new Transform({
      writableObjectMode: true,
      readableObjectMode: true,
      transform(chunk, encoding, callback) {
        console.log(util.inspect(chunk, { depth: 10, colors: true }));
        callback(null, chunk);
      },
      flush(callback) {
        callback();
      },
    });

    this.stream.on('pipe', source => {
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
