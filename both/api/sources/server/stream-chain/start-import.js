import Stream from 'stream';
import Fiber from 'fibers';
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';

import { checkExistenceAndFullAccessToSourceId } from '/both/api/sources/server/privileges';
import { SourceImports } from '/both/api/source-imports/source-imports';

import { createStreamChain } from './stream-chain';


const sourceIdsToStreamChains = {};


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
  const streamChain = createStreamChain({
    sourceImportId,
    sourceId,
    inputStreamToReplaceFirstStream,
    streamChainConfig: source.streamChain,
  });
  sourceIdsToStreamChains[sourceId] = streamChain;
  return sourceImportId;
}

Meteor.methods({
  'sources.startImport'(sourceId) {
    check(sourceId, String);
    this.unblock();
    Fiber(() => startImport({ sourceId, userId: this.userId })).run();
  },
});
