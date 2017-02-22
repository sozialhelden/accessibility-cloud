/* global Migrations: true */

import { Sources } from '/both/api/sources/sources';
import { ImportFlows } from '/both/api/import-flows/import-flows';

Migrations.add({
  version: 1,
  up() {
    Sources.find({ streamChain: { $exists: true } }).forEach((source) => {
      const sourceId = source._id;

      ImportFlows.insert({
        sourceId,
        name: 'Default',
        streams: source.streamChain,
        createdAt: Date.now()
      });
      Sources.update({ _id: sourceId }, { $unset: { streamChain: true } }, { bypassCollection2: true });
    });
  },
  down() {
    ImportFlows.find({}).forEach((importFlow) => {
      const sourceId = importFlow.sourceId;

      Sources.update({ _id: sourceId }, { $set: { streamChain: importFlow.streams } });
      ImportFlows.remove({ _id: importFlow._id });
    });
  },
});

Meteor.startup(() => {
  Migrations.migrateTo('latest');
});
