import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { SourceImports } from '../source-imports.js';
import { publishPublicFields } from '/server/publish';
import { publishPrivateFieldsForMembers } from '/both/api/organizations/server/publications';

publishPublicFields('sourceImports', SourceImports);
publishPrivateFieldsForMembers('sourceImports', SourceImports);

Meteor.publish('sourceImports.attributeDistribution', function publish(sourceImportId) {
  check(sourceImportId, String);
  this.autorun(() => {
    const visibleSelector = SourceImports.visibleSelectorForUserId(this.userId);
    const selector = { $and: [{ _id: sourceImportId }, visibleSelector] };
    return SourceImports.find(
      selector,
      { fields: { attributeDistribution: 1 } }
    );
  });
});
