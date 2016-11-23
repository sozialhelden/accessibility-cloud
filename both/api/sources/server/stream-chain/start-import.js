import Stream from 'stream';
import Fiber from 'fibers';
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';

import { checkExistenceAndFullAccessToSourceId } from '/both/api/sources/server/privileges';
import { SourceImports } from '/both/api/source-imports/source-imports';

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

export function startImport({ userId, sourceId, inputStreamToReplaceFirstStream }) {
  console.log('Requested import for source', sourceId, '…');

  check(userId, String);
  check(sourceId, String);
  check(inputStreamToReplaceFirstStream, Match.Optional(Stream));

  const source = checkExistenceAndFullAccessToSourceId(userId, sourceId);

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
    abortImport(sourceId);
    const streamChain = createStreamChain({
      sourceImportId,
      sourceId,
      inputStreamToReplaceFirstStream,
      streamChainConfig: source.streamChain,
    });
    sourceIdsToStreamChains[sourceId] = streamChain;
  } catch (e) {
    if (e instanceof Meteor.Error) {
      throw e;
    }
    console.log('Error while setting up stream chain:', e, e.stack);
    throw Meteor.Error(500, 'Could not create stream chain.');
  }
  return sourceImportId;
}

Meteor.methods({
  'sources.startImport'(sourceId) {
    check(sourceId, String);
    this.unblock();
    Fiber(() => startImport({ sourceId, userId: this.userId })).run();
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
