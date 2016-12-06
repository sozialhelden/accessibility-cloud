import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { check } from 'meteor/check';

import { checkExistenceAndFullAccessToSourceId } from '/both/api/sources/server/privileges';
import { SourceImports } from '/both/api/source-imports/source-imports';
import { Sources } from '/both/api/sources/sources';

import { createStreamChain } from './stream-chain';


const sourceIdsToStreamChains = {};

function abortImport(sourceId) {
  if (sourceIdsToStreamChains[sourceId]) {
    sourceIdsToStreamChains[sourceId][0].stream.abortChain();
    sourceIdsToStreamChains[sourceId].forEach(streamObserver => {
      const stream = streamObserver.stream;
      if (typeof streamObserver.abort === 'function') {
        streamObserver.abort();
      }
      if (typeof stream.abort === 'function') {
        stream.abort();
      }
      stream.abortStream();
      stream.emit('abort');
      // stream.emit('error', new Error('Stream aborted'));
    });
    delete sourceIdsToStreamChains[sourceId];
    console.log('Aborted streams for source', sourceId);
  }
}

function startImportStreaming(source) {
  const sourceId = source._id;
  const sourceImportId = SourceImports.insert({
    sourceId,
    organizationId: source.organizationId,
    streamChain: source.streamChain,
    startTimestamp: Date.now(),
    numberOfPlacesAdded: 0,
    numberOfPlacesModified: 0,
    numberOfPlacesRemoved: 0,
    numberOfPlacesUnchanged: 0,
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

export function startImport({ userId, sourceId }) {
  console.log('Requested import for source', sourceId, '…');

  check(userId, String);
  check(sourceId, String);
  checkExistenceAndFullAccessToSourceId(userId, sourceId);

  console.log('Ensure no other import is running...');

  Sources.rawCollection().findAndModify(
    { _id: sourceId, $or: [{ running: false }, { running: { $exists: false } }] },
    {},
    { $set: { running: true } },
    {},
    Meteor.bindEnvironment((error, { lastErrorObject, value, ok }) => {
      if (!ok) {
        console.error('Error after findAndModify:', lastErrorObject);
        throw error;
      }
      const source = value;
      if (source) {
        console.log('Found non-running source', source);
      } else {
        throw new Meteor.Error(422, 'Another import is already running.');
      }

      startImportStreaming(source);
    })
  );
  // return sourceImportId;
}

Meteor.methods({
  'sources.startImport'(sourceId) {
    check(sourceId, String);
    this.unblock();
    startImport({ sourceId, userId: this.userId });
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
