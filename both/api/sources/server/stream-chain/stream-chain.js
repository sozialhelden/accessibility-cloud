import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Stream from 'stream';
import vstream from 'vstream';
import { SourceImports } from '/both/api/source-imports/source-imports';

import { ConsoleOutput } from './stream-types/console-output';
import { ConvertToUTF8 } from './stream-types/convert-to-utf8';
import { Generic } from './stream-types/generic';
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
  Generic,
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

function setupEventHandlersOnStream({ errorKey, stream, sourceImportId, type, index }) {
  stream.on('error', Meteor.bindEnvironment(error => {
    console.log('Error on', type, 'stream (#', index, 'in chain):', error, error.stack);
    const modifier = { $set: { [errorKey]: {
      reason: error.reason,
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
    } } };
    SourceImports.update(sourceImportId, modifier);
  }));

  stream.on('finish', Meteor.bindEnvironment(() => {
    const modifier = { $set: {
      finishedTimestamp: Date.now(),
    } };
    SourceImports.update(sourceImportId, modifier);
  }));
}

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
  // console.log('Supported stream types:', StreamTypes);
  check(streamChainConfig, [Object]);

  let previousStream = inputStreamToReplaceFirstStream || null;
  const skipCount = inputStreamToReplaceFirstStream ? 1 : 0;
  const modifiedStreamChainConfig = streamChainConfig.splice(skipCount);
  if (inputStreamToReplaceFirstStream) {
    modifiedStreamChainConfig.unshift({
      type: 'Generic',
      parameters: {
        stream: inputStreamToReplaceFirstStream,
      },
    });
  }

  const result = modifiedStreamChainConfig.map(({ type, parameters }, index) => {
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
      throw new Error(422, `ERROR: "${type}" is not a valid stream type.`);
    }
    const runningStreamObserver = new StreamTypes[type](parameters);

    // Validate setting up Step with parameters worked
    check(runningStreamObserver.stream, Stream);

    setupEventHandlersOnStream({
      errorKey,
      stream: runningStreamObserver.stream,
      sourceImportId,
      type,
      index,
    });

    const wrappedStream = vstream.wrapStream(runningStreamObserver.stream, type);

    // Connect to previous stream's output if existing
    previousStream = previousStream ? previousStream.pipe(wrappedStream) : wrappedStream;

    return runningStreamObserver;
  });

  if (inputStreamToReplaceFirstStream) {
    const streamReport = (eventName) => () => {
      console.log('------', eventName, '------');
      result[0].stream.vsWalk(stream => stream.vsDumpDebug(process.stdout));
    };
    inputStreamToReplaceFirstStream.on('data', streamReport('data'));
    inputStreamToReplaceFirstStream.on('error', streamReport('error'));
    inputStreamToReplaceFirstStream.on('finish', streamReport('finish'));
    if (inputStreamToReplaceFirstStream !== result[result.length - 1].stream.vsHead()) {
      throw new Meteor.Error(500, 'Stream chain not correctly built.');
    }
  }
  return result;
}
