// import { Npm } from 'meteor/npm';
const zstreams = Npm.require('zstreams');

export default class ConsoleOutput {
  constructor() {
    this.stream = new zstreams.ConsoleLogStream({
      writableObjectMode: true,
    });
  }

  dispose() {
    delete this.stream;
  }

  static getParameterSchema() {
    return {};
  }
}
