import CSVStream from 'csvstream';
import { check } from 'meteor/check';

export class ParseCSVStream {
  constructor(options) {
    // check(delimiter, String);
    // check(endLine, String);
    // check(escapeChar, String);
    // check(enclosedChar, String);

    //this.stream = JSONStream.parse(path);
    // this.stream = csv.createStream({ delimiter, endLine, escapeChar, enclosedChar });
    this.stream = new CSVStream(options);
  }
}

/*
var csvstream = require('csvstream');
var fs = require('fs');

var rs = fs.createReadStream('./test/test1.csv');
var ws_head = fs.createWriteStream('./test/output2.json');

var csvs = new csvstream({header: true}, function(err, result) {
  if(err)
    console.error(err);

  console.log(result);
  //  [ 
  //    { aaa: '1', bbb: '2', ccc: '3' },
  //    { aaa: '4', bbb: '5', ccc: '6' },
  //    { aaa: '7', bbb: '8', ccc: '9' } 
  //  ])
});

rs.pipe(csvs).pipe(ws_head);
*/