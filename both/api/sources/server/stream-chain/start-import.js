import Stream from 'stream';
import Fiber from 'fibers';
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';

import { OrganizationMembers } from '/both/api/organization-members/organization-members.js';
import { Sources } from '/both/api/sources/sources';
import { SourceImports } from '/both/api/source-imports/source-imports';

import { createStreamChain } from './stream-chain';


const sourceIdsToStreamChains = {};


export function startImport({ userId, sourceId, inputStreamToReplaceFirstStream }) {
  console.log('Requested import for source', sourceId, '…');

  check(sourceId, String);
  check(inputStreamToReplaceFirstStream, Match.Optional(Stream));

  const source = Sources.findOne({ _id: sourceId });
  if (!source) {
    throw new Meteor.Error(404, 'Source not found.');
  }

  const member = OrganizationMembers.find({ userId, organizationId: source.organizationId });
  if (!member) {
    throw new Meteor.Error(401, 'Not authorized for given source.');
  }

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
