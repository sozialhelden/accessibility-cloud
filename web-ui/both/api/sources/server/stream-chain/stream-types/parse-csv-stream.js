import CSVStream from 'csvstream';
// import { check } from 'meteor/check';

export class ParseCSVStream {
  constructor(options) {
    this.stream = new CSVStream(options);
  }
}
