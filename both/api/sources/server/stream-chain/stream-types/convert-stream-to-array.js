const { Transform } = Npm.require('zstreams');

export default class ConvertStreamToArray {
  constructor() {
    const resultArray = [];
    this.stream = new Transform({
      writableObjectMode: true,
      readableObjectMode: true,
      transform(chunk, encoding, callback) {
        resultArray.push(chunk);
        callback();
      },
      flush(callback) {
        this.push(resultArray);
        callback(null, resultArray);
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
