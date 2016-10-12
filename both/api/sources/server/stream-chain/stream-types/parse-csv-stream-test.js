import CSVStream from 'csvstream';
// import { check } from 'meteor/check';

export class ParseCSVStreamTest {
  constructor(options) {
    this.stream = new CSVStream(options);
  }
}
