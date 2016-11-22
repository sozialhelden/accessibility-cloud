// import { Npm } from 'meteor/npm';
const zstreams = Npm.require('zstreams');

export class ConsoleOutput {
  constructor() {
    this.stream = new zstreams.ConsoleLogStream();
  }

  static getParameterSchema() {
    return {};
  }
}
