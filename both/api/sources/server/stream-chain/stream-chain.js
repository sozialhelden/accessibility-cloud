import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Stream from 'stream';
import vstream from 'vstream';
import { SourceImports } from '/both/api/source-imports/source-imports';

import { ConsoleOutput } from './stream-types/console-output';
import { ConvertToUTF8 } from './stream-types/convert-to-utf8';
import { DebugLog } from './stream-types/debug-log';
import { Generic } from './stream-types/generic';
import { HTTPDownload } from './stream-types/http-download';
import { MultiHTTPDownload } from './stream-types/multi-http-download';
import { ParseJSONStream } from './stream-types/parse-json-stream';
import { ParseJSONChunks } from './stream-types/parse-json-chunks';
import { ParseCSVStreamTest } from './stream-types/parse-csv-stream-test';
import { ParseCSVStream } from './stream-types/parse-csv-stream';
import { Split } from './stream-types/split';
import { TransformData } from './stream-types/transform-data';
import { TransformScript } from './stream-types/transform-script';
import { UpsertPlace } from './stream-types/upsert-place';
import { InsertPlace } from './stream-types/insert-place';
import { TransformJaccedeFormat } from './stream-types/transform-jaccede-format';

const StreamTypes = {
  ConsoleOutput,
  ConvertToUTF8,
  DebugLog,
  Generic,
  HTTPDownload,
  TransformScript,
  MultiHTTPDownload,
  ParseJSONStream,
  ParseJSONChunks,
  ParseCSVStreamTest,
  ParseCSVStream,
  Split,
  TransformData,
  UpsertPlace,
  InsertPlace,
  TransformJaccedeFormat,
};

function cleanStackTrace(stackTrace) {
  return stackTrace
    .split('\n')
    .filter(line => !line.match(/node_modules/))
    .join('\n');
}

function setupEventHandlersOnStream({
  errorKey, progressKey, stream, sourceImportId, type, index,
}) {
  stream.on('error', Meteor.bindEnvironment(error => {
    console.log(
      'Error on', type, 'stream (#', index, 'in chain):', error, cleanStackTrace(error.stack)
    );
    const modifier = {
      $set: {
        [errorKey]: {
          reason: error.reason,
          message: error.message,
          stack: cleanStackTrace(error.stack),
          timestamp: Date.now(),
        },
        [`${progressKey}.hasError`]: true,
      },
    };
    SourceImports.update(sourceImportId, modifier);
  }));

  stream.on('end', Meteor.bindEnvironment(() => {
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
    const streamChainElementKey = `streamChain.${index}`;
    const debugInfoKey = `${streamChainElementKey}.debugInfo`;
    const progressKey = `${streamChainElementKey}.progress`;
    const errorKey = `${streamChainElementKey}.error`;

    // Setup parameters for stream object
    Object.assign(parameters, {
      sourceId,
      sourceImportId,
      onProgress: Meteor.bindEnvironment(progress => {
        if (progress.percentage === 100) {
          Object.assign(progress, { isFinished: true });
        }
        const modifier = { $set: { [progressKey]: progress } };
        SourceImports.update(sourceImportId, modifier);
      }),
      onDebugInfo: Meteor.bindEnvironment(debugInfo => {
        const debugInfoWithPaths = {};
        Object.keys(debugInfo).forEach(key => {
          debugInfoWithPaths[`${debugInfoKey}.${key}`] = debugInfo[key];
        });
        const modifier = { $set: debugInfoWithPaths };
        SourceImports.update(sourceImportId, modifier);
      }),
    });

    if (StreamTypes[type] === undefined) {
      throw new Meteor.Error(422, `ERROR: "${type}" is not a valid stream type.`);
    }
    const runningStreamObserver = new StreamTypes[type](parameters);

    // Validate setting up Step with parameters worked
    check(runningStreamObserver.stream, Stream);

    setupEventHandlersOnStream({
      errorKey,
      progressKey,
      stream: runningStreamObserver.stream,
      sourceImportId,
      type,
      index,
    });

    const wrappedStream = vstream.wrapStream(runningStreamObserver.stream, type);

    // wrappedStream vsCounterBump
    // Connect to previous stream's output if existing
    previousStream = previousStream ? previousStream.pipe(wrappedStream) : wrappedStream;

    return runningStreamObserver;
  });

  // console.log('Stream chain:', result);

  const firstStream = result[0] && result[0].stream;
  const lastStream = result[result.length - 1] && result[result.length - 1].stream;
  if (firstStream) {
    // const streamReport = (eventName) => () => {
    //   console.log('------', eventName, '------');
    //   firstStream.vsWalk(stream => {
    //     stream.vsDumpDebug(process.stdout);
    //   });
    // };
    // firstStream.on('data', streamReport('data'));
    // firstStream.on('error', streamReport('error'));
    // lastStream.on('end', streamReport('end'));
    if (firstStream !== lastStream.vsHead()) {
      throw new Meteor.Error(500, 'Stream chain not correctly built.');
    }
  }
  return result;
}
