const { Transform } = Npm.require('zstreams');

export class ArrayReadable {
  constructor() {
    this.stream = new Transform({
      writableObjectMode: true,
      readableObjectMode: true,
      transform(array, encoding, callback) {
        for (const value of array) {
          this.push(value);
        }
        callback();
      },
    });
    this.stream.unitName = 'array elements';
  }

  static getParameterSchema() {
    return {};
  }
}
