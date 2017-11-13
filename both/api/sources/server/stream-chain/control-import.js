import Future from 'fibers/future';
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { check } from 'meteor/check';

import { checkExistenceAndFullAccessToSourceId } from '/both/api/sources/server/privileges';
import { SourceImports } from '/both/api/source-imports/source-imports';
import { Sources } from '/both/api/sources/sources';

import { createStreamChain } from './stream-chain';


const sourceIdsToStreamChains = {};

export function abortImport(sourceId) {
  if (sourceIdsToStreamChains[sourceId]) {
    const firstStreamObserver = sourceIdsToStreamChains[sourceId][0];
    const firstStream = firstStreamObserver && firstStreamObserver.stream;
    if (firstStream && typeof firstStream.abortChain === 'function') {
      firstStream.abortChain();
    }
    sourceIdsToStreamChains[sourceId].forEach(streamObserver => {
      if (typeof streamObserver.abort === 'function') {
        streamObserver.abort();
      }
      const stream = streamObserver.stream;
      if (!stream) {
        return;
      }
      if (typeof stream.abort === 'function') {
        stream.abort();
      }
      if (typeof stream.abortStream === 'function') {
        stream.abortStream();
      }
      if (typeof stream.emit === 'function') {
        stream.emit('abort');
      }
    });
    delete sourceIdsToStreamChains[sourceId];
  }

  Sources.update(sourceId, { $set: { hasRunningImport: false } });
  console.log('Aborted streams for source', sourceId);
}

function startImportStreaming(source) {
  const sourceId = source._id;
  const sourceImportId = SourceImports.insert({
    sourceId,
    organizationId: source.organizationId,
    streamChain: source.streamChain,
    originalStreamChain: source.streamChain,
    startTimestamp: Date.now(),
    insertedDocumentCount: 0,
    updatedDocumentCount: 0,
  });
  console.log('Creating stream chain for source import', sourceImportId, '…');

  try {
    const streamChain = createStreamChain({
      sourceImportId,
      sourceId,
      streamChainConfig: source.streamChain,
    });
    sourceIdsToStreamChains[sourceId] = streamChain;
  } catch (error) {
    console.log('Error while setting up stream chain:', error, error.stack);
    SourceImports.update(sourceImportId, {
      $set: { error: _.pick(error, 'reason', 'message', 'errorType') },
    });
  }
}

export function startImportIfPossible({ userId, sourceId }, callback) {
  console.log('Requested import for source', sourceId, '…');

  check(userId, String);
  check(sourceId, String);
  checkExistenceAndFullAccessToSourceId(userId, sourceId);

  console.log('Ensure no other import is running...');

  Sources.rawCollection().findAndModify(
    { _id: sourceId, $or: [{ hasRunningImport: false }, { hasRunningImport: { $exists: false } }] },
    {},
    { $set: { hasRunningImport: true } },
    {},
    Meteor.bindEnvironment((error, { lastErrorObject, value, ok }) => {
      if (!ok) {
        console.error('Error after findAndModify:', lastErrorObject);
        callback(lastErrorObject);
        return;
      }

      const source = value;
      if (source) {
        console.log('Found non-running source with id', sourceId);
      } else {
        callback(new Meteor.Error(422, 'Another import is already running.'));
        return;
      }

      startImportStreaming(source);

      callback(null);
    })
  );
}

Meteor.methods({
  'sources.startImport'(sourceId) {
    check(sourceId, String);
    this.unblock();
    const future = new Future();
    startImportIfPossible({ sourceId, userId: this.userId }, error => {
      if (error) {
        future.throw(error);
        return;
      }
      console.log('Started import.');
      future.return();
    });
    return future.wait();
  },
  'sources.abortImport'(sourceId) {
    this.unblock();
    check(this.userId, String);
    check(sourceId, String);
    if (checkExistenceAndFullAccessToSourceId(this.userId, sourceId)) {
      abortImport(sourceId);
    }
  },
});
