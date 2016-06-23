

if (require.main !== module) {
    console.log('Call from command line!');
    return;
}
if (process.argv.length < 3) {
    console.log('Use: node run.js <source> [sample only? (yes >no<)]');
    console.log('Source only as name, without path and suffix, i.e. "node run.js vienna"' );
    process.exit(1);
}
var sd = process.argv[2];
var so = process.argv[3] !== undefined;
var Converter = require('./converter.js');
var conv_name = (new Converter('???', sd)).source_description.converter; // Use converter class to find the converter name
var convert = require('./' + conv_name + '.js');

convert(sd,so);
