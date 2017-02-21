import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ImportFlows } from '../import-flows.js';

const options = { fields: ImportFlows.publicFields };

Meteor.publish('importFlows.forSource', sourceId => {
  check(sourceId, String);

  const selector = { sourceId };

  return ImportFlows.find(selector, options);
});
