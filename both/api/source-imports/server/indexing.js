import { Meteor } from 'meteor/meteor';
import { SourceImports } from '../source-imports';

Meteor.startup(() => {
  SourceImports._ensureIndex({ sourceId: 1 });
  SourceImports._ensureIndex({ organizationId: 1 });
  SourceImports._ensureIndex({ startTimestamp: 1 });
});
