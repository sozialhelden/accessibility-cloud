import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Stream from 'stream';
import { SourceImports } from '/both/api/source-imports/source-imports';

import { ConsoleOutput } from './stream-types/console-output';
import { ConvertToUTF8 } from './stream-types/convert-to-utf8';
import { HTTPDownload } from './stream-types/http-download';
import { ParseJSONStream } from './stream-types/parse-json-stream';
import { ParseJSONChunks } from './stream-types/parse-json-chunks';
import { ParseCSVStreamTest } from './stream-types/parse-csv-stream-test';
import { ParseCSVStream } from './stream-types/parse-csv-stream';
import { ReadFile } from './stream-types/read-file';
import { Split } from './stream-types/split';
import { TransformData } from './stream-types/transform-data';
import { UpsertPlace } from './stream-types/upsert-place';

const StreamTypes = {
  ConsoleOutput,
  ConvertToUTF8,
  HTTPDownload,
  ParseJSONStream,
  ParseJSONChunks,
  ParseCSVStreamTest,
  ParseCSVStream,
  ReadFile,
  Split,
  TransformData,
  UpsertPlace,
};

// Returns an array of Node.js stream objects (encapsulated in observer objects) generated
// from given stream chain configuration.
export function createStreamChain({
  // An array of objects. Each object configures a part of the stream chain.
  streamChainConfig,
  // Reference to a SourceImports document that should be updated with progress info
  sourceImportId,
  // Reference to a source that this import belongs to.
  sourceId,
  // Optional: An input stream that will be used to replace the first stream object
  inputStreamToReplaceFirstStream,
}) {
  check(streamChainConfig, [Object]);
  let previousStream = inputStreamToReplaceFirstStream || null;
  console.log('Supported stream types:', StreamTypes);
  const skipCount = inputStreamToReplaceFirstStream ? 1 : 0;
  return streamChainConfig.splice(skipCount).map(({ type, parameters }, index) => {
    check(type, String);
    check(parameters, Object);
    console.log('Creating', type, 'stream...');
    const debugInfoKey = `streamChain.${index}.debugInfo`;
    const progressKey = `${debugInfoKey}.progress`;
    const errorKey = `${debugInfoKey}.error`;

    // Setup parameters for stream object
    Object.assign(parameters, {
      sourceId,
      sourceImportId,
      onProgress: Meteor.bindEnvironment(progress => {
        const modifier = { $set: { [progressKey]: progress } };
        SourceImports.update(sourceImportId, modifier);
      }),
      onDebugInfo: Meteor.bindEnvironment(debugInfo => {
        const modifier = { $set: { [debugInfoKey]: debugInfo } };
        SourceImports.update(sourceImportId, modifier);
      }),
    });

    if (StreamTypes[type] === undefined) {
      console.warn('ERROR: ${type} is not a valid stream type.`');
      return {};
    }
    const runningStreamObserver = new StreamTypes[type](parameters);

    // Validate setting up Step with parameters worked
    check(runningStreamObserver.stream, Stream);

    // Execute
    runningStreamObserver.stream.on('error', Meteor.bindEnvironment(error => {
      const modifier = { $set: { [errorKey]: {
        reason: error.reason,
        //stack: error.stack,
      } } };
      SourceImports.update(sourceImportId, modifier);
    }));

    // Connect to previous stream's output
    if (previousStream) {
      previousStream.pipe(runningStreamObserver.stream);
    }
    previousStream = runningStreamObserver.stream;

    return runningStreamObserver;
  });
}
