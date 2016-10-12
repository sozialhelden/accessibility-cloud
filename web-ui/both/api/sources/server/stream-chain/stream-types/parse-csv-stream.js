import FastCSV from 'fast-csv';

export class ParseCSVStream {
  constructor(options) {
    this.stream = new FastCSV(options);
      // .transform(function(data) {
      //   console.log(">>>>>>>> Tranform", data);
      // });
  }
}
