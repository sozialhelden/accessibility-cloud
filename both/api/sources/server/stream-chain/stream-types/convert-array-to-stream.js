const { Transform } = Npm.require('zstreams');

export class ConvertArrayToStream {
  constructor() {
    this.stream = new Transform({
      writableObjectMode: true,
      readableObjectMode: true,
      transform(array, encoding, callback) {
        setImmediate(() => {
          for (const value of array) {
            this.push(value);
          }
          callback();
        });
      },
    });
    this.stream.unitName = 'array elements';
  }

  static getParameterSchema() {
    return {};
  }
}
