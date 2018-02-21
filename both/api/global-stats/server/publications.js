import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { GlobalStats } from '../global-stats.js';

Meteor.publish('globalStats.lastCollectionCount', (collectionName) => {
  check(collectionName, String);
  return GlobalStats.find(
    { name: `${collectionName}.count` },
    { sort: { date: -1 }, limit: 1 },
  );
});
