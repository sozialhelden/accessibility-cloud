import { Meteor } from 'meteor/meteor';
import { SourceImports } from '/both/api/source-imports/source-imports';
import { Sources } from '/both/api/sources/sources';

Meteor.startup(() => {
  const selector = { streamChain: { $elemMatch: { 'progress.isFinished': { $exists: false } } } };
  const unfinishedSourceImports = SourceImports.find(selector).fetch();
  console.log('Found', unfinishedSourceImports.length, 'left over unfinished source imports.');
  unfinishedSourceImports.forEach(sourceImport => {
    sourceImport.setUnfinishedStreamsToAborted();
  });

  Sources.update({}, { $set: { hasRunningImport: false } });
});
