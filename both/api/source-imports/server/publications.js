import util from 'util';
import { Meteor } from 'meteor/meteor';
import { Sources } from '/both/api/sources/sources';
import { check } from 'meteor/check';
import { SourceImports } from '../source-imports.js';
import { publishPublicFields } from '/server/publish';
import { publishPrivateFieldsForMembers } from '/both/api/organizations/server/publications';



const selectorFn = (userId, sourceId) => {
  check(userId, String);
  check(sourceId, String);
  return { sourceId };
};

publishPublicFields('sourceImports.last', SourceImports, selectorFn, { limit: 1, sort: { startTimestamp: -1 } });
publishPublicFields('sourceImports', SourceImports, selectorFn, { limit: 50, sort: { startTimestamp: -1 } });
publishPrivateFieldsForMembers('sourceImports', SourceImports, selectorFn, { limit: 50, sort: { startTimestamp: -1 } });


Meteor.publish('sourceImports.stats.public', function publish(sourceId) {
  check(sourceId, String);
  this.autorun(() => {
    const source = Sources.findOne(sourceId);
    if (!source) {
      return [];
    }

    const visibleSelector = SourceImports.visibleSelectorForUserId(this.userId);

    let selector;
    if (source.isFreelyAccessible && !source.isDraft) {
      selector = { sourceId };
    } else {
      selector = { $and: [visibleSelector, { sourceId }] };
    }

    return SourceImports.find(
      selector,
      { fields: SourceImports.statsFields },
    );
  });
});
