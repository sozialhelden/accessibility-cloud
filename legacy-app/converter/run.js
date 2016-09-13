

if (require.main !== module) {
    console.log('Call from command line!');
    return;
}

var Converter = require('./converter.js');


if (process.argv.length < 3) {
    console.log('Use: node run.js <source> [sample only? (yes >no<)]');
    console.log('Source only as name, without path and suffix, i.e. "node run.js vienna"\nCurrently available sources:');
    for (let s of Converter.GetSourceList())
        console.log(s);
    process.exit(1);
}
var sd = process.argv[2];
var so = process.argv[3] !== undefined;
var conv_name = Converter.GetSourceDescription(sd).converter; // Use converter class to find the converter name
var instance = require('./' + conv_name + '.js');

console.log("Starting " + conv_name + " converter with source " + sd + " Sample only: " + so);
var conv = instance(sd,so);
conv.run(so); // we don't care for errors here, they will be logged anyway
conv.emitter.on('ready', () => {
    conv.logger.info('Finished successfully, output file is ' + conv.output_file);
    conv.storeResult();
});
