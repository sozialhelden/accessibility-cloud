import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import Stream from 'stream';

import { startObservingObjectProgress } from './object-progress-stream';
import { abortImport } from './control-import';

import { SourceImports } from '/both/api/source-imports/source-imports';
import { Sources } from '/both/api/sources/sources';

import ConsoleOutput from './stream-types/console-output';
import ConvertToUTF8 from './stream-types/convert-to-utf8';
import DebugLog from './stream-types/debug-log';
import HTTPDownload from './stream-types/http-download';
import MultiHTTPDownload from './stream-types/multi-http-download';
import ParseJSONStream from './stream-types/parse-json-stream';
import ParseJSONChunks from './stream-types/parse-json-chunks';
import ParseCSVStreamTest from './stream-types/parse-csv-stream-test';
import ParseCSVStream from './stream-types/parse-csv-stream';
import ParseXMLStream from './stream-types/parse-xml-stream';
import Split from './stream-types/split';
import Skip from './stream-types/skip';
import Filter from './stream-types/filter';
import Limit from './stream-types/limit';
import ConvertArrayToStream from './stream-types/convert-array-to-stream';
import ConvertStreamToArray from './stream-types/convert-stream-to-array';
import TransformData from './stream-types/transform-data';
import TransformKobo from './stream-types/transform-kobo/transform-kobo';
import UploadKoboAttachments from './stream-types/transform-kobo/upload-kobo-attachments';
import EnrichTrackingEvents from './stream-types/transform-kobo/enrich-tracking-events';
import TransformScript from './stream-types/transform-script';
import UpsertPlace from './stream-types/upsert-place';
import UpsertDisruption from './stream-types/upsert-disruption';
import UpsertEquipment from './stream-types/upsert-equipment';
import SimplifyJaccedeFormat from './stream-types/simplify-jaccede-format';
import ReimportSource from './stream-types/reimport-source';

// import ValidatePlace from './stream-types/validate-place';

const zstreams = Npm.require('zstreams');

const StreamTypes = {
  ConsoleOutput,
  ConvertToUTF8,
  DebugLog,
  HTTPDownload,
  TransformScript,
  MultiHTTPDownload,
  ParseJSONStream,
  Filter,
  ParseJSONChunks,
  ParseXMLStream,
  ParseCSVStreamTest,
  ParseCSVStream,
  Split,
  TransformData,
  TransformKobo,
  UploadKoboAttachments,
  UpsertPlace,
  UpsertDisruption,
  UpsertEquipment,
  SimplifyJaccedeFormat,
  Skip,
  Limit,
  ConvertArrayToStream,
  ConvertStreamToArray,
  ReimportSource,
  EnrichTrackingEvents,
  // ValidatePlace,
};

function cleanStackTrace(stackTrace) {
  return stackTrace
    .split('\n')
    .filter(line => !line.match(/node_modules/))
    .join('\n');
}

function setupEventHandlersOnStream({
  errorKey, progressKey, stream, sourceImportId, type, index, abortFn,
}) {
  stream.once('error', Meteor.bindEnvironment(error => {
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
    abortFn();
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
}) {
  // console.log('Supported stream types:', StreamTypes);
  check(streamChainConfig, [Object]);

  let previousStream = null;

  const source = Sources.findOne(sourceId);
  const lastSuccessfulImport = source.getLastSuccessfulImport();
  let isAborted = false;
  const abortFn = () => {
    if (!isAborted) {
      isAborted = true;
      abortImport(sourceId);
    }
  };

  const result = streamChainConfig.map(({ type, parameters = {}, skip = false }, index) => {
    if (!type) {
      throw new Meteor.Error(422, `Stream chain element at index ${index} must have a type.`);
    }
    if (type instanceof String) {
      throw new Meteor.Error(422, `Stream chain element type at index ${index} must be a String.`);
    }
    if (!Object.keys(StreamTypes).includes(type)) {
      throw new Meteor.Error(422, `Stream type ${type} isn't supported.`);
    }

    check(parameters, Match.ObjectIncluding({}));
    check(skip, Boolean);

    // console.log('Creating', type, 'stream...');

    const streamChainElementKey = `streamChain.${index}`;
    const debugInfoKey = `${streamChainElementKey}.debugInfo`;
    const progressKey = `${streamChainElementKey}.progress`;
    const errorKey = `${streamChainElementKey}.error`;
    const skippedKey = `${streamChainElementKey}.isSkipped`;

    const onProgress = Meteor.bindEnvironment(progress => {
      if (progress.percentage === 100) {
        Object.assign(progress, { isFinished: true });
      }
      const modifier = { $set: { [progressKey]: progress } };
      SourceImports.update(sourceImportId, modifier);
      if (progress.isAborted) {
        Meteor.defer(() => abortFn());
      }
    });

    // Setup parameters for stream object
    Object.assign(parameters, {
      sourceId,
      source,
      lastSuccessfulImport,
      sourceImportId,
      onDebugInfo: Meteor.bindEnvironment(debugInfo => {
        const debugInfoWithPaths = {};
        Object.keys(debugInfo).forEach(key => {
          debugInfoWithPaths[`${debugInfoKey}.${key}`] = debugInfo[key];
        });
        const modifier = { $set: debugInfoWithPaths };
        try {
          SourceImports.update(sourceImportId, modifier);
        } catch (error) {
          console.log('Could not write debug info', debugInfo, ':', error);
        }
      }),
    });

    const StreamType = StreamTypes[type];
    if (StreamType === undefined) {
      throw new Meteor.Error(422, `ERROR: "${type}" is not a valid stream type.`);
    }
    if (typeof StreamType !== 'function') {
      throw new Meteor.Error(422, `ERROR: "${type}" is not a valid stream type function.`);
    }
    const runningStreamObserver = new StreamType(parameters);

    // Validate setting up Step with parameters worked
    check(runningStreamObserver.stream, Stream);

    const wrappedStream = runningStreamObserver.stream = zstreams(runningStreamObserver.stream);


    setupEventHandlersOnStream({
      errorKey,
      progressKey,
      stream: wrappedStream,
      sourceImportId,
      abortFn,
      type,
      index,
    });

    // Prevent data from flowing before the stream is fully set up
    wrappedStream.pause();
    if (wrappedStream.cork) {
      wrappedStream.cork();
    }

    startObservingObjectProgress(wrappedStream, onProgress);

    if (skip) {
      console.log('Skipping stream.');
      runningStreamObserver.isSkipped = true;
      SourceImports.update(sourceImportId, { $set: { [skippedKey]: true } });
    } else {
      // Connect to previous stream's output if existing
      previousStream = previousStream ? previousStream.pipe(wrappedStream) : wrappedStream;
    }

    return runningStreamObserver;
  });

  // console.log('Stream chain:', result[0].stream.getStreamChain());

  const lastStreamObserver = result.reverse().find(s => !s.isSkipped);
  if (!lastStreamObserver) {
    console.log('No streams in stream chain found.');
    return result;
  }

  lastStreamObserver.stream.intoCallback(Meteor.bindEnvironment((error) => {
    if (error) {
      console.log('Stream chain ended with error', error);
      abortImport(sourceId);
    } else {
      console.log('Import ended without error.');
      const lastImportType = Sources.findOne(sourceId).getType();
      Sources.update(sourceId, { $set: {
        hasRunningImport: false,
        lastSuccessfulImportId: sourceImportId,
        lastImportType,
      } });
      SourceImports.update(sourceImportId, { $set: { isFinished: true } });
    }
    Meteor.setTimeout(() => {
      result.forEach(observer => {
        if (observer.dispose) { observer.dispose(); }
      });
      SourceImports.findOne(sourceImportId).generateAndSaveStats();
    }, 1000);
  }));

  Meteor.setTimeout(() => {
    result.forEach((observer) => {
      if (observer && observer.stream && observer.stream.uncork) {
        observer.stream.uncork();
      }
      if (observer && observer.stream && observer.stream.resume) {
        observer.stream.resume();
      }
    });
  }, 1000);

  return result;
}
