import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Sources } from '/both/api/sources/sources';
import { SourceImports } from '/both/api/source-imports/source-imports';
import { isAdmin } from '/both/lib/is-admin';
import { createStreamChain } from './stream-chain';

const sourceIdsToStreamChains = {};

Meteor.methods({
  'sources.startImport'(sourceId) {
    this.unblock();
    console.log('Requested import for source', sourceId, '…');
    check(sourceId, String);
    if (!isAdmin(this.userId)) {
      throw Meteor.Error(401, 'Not authorized.');
    }
    const source = Sources.findOne(sourceId);
    if (!source) {
      throw Meteor.Error(404, 'Source not found.');
    }
    const sourceImportId = SourceImports.insert({
      sourceId,
      streamChain: source.streamChain,
      startTimestamp: Date.now(),
      numberOfPlacesAdded: 0,
      numberOfPlacesModified: 0,
      numberOfPlacesRemoved: 0,
      numberOfPlacesUnchanged: 0,
    });
    console.log('Creating stream chain for source import', sourceImportId, '…');
    const streamChain = createStreamChain(source.streamChain, sourceImportId, sourceId);
    sourceIdsToStreamChains[sourceId] = streamChain;
    return sourceImportId;
  },
});
