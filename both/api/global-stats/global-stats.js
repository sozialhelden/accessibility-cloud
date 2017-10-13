import { check } from 'meteor/check';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const GlobalStats = new Mongo.Collection('GlobalStats');

GlobalStats.schema = new SimpleSchema({
  name: { type: String },
  value: { type: Number },
  date: { type: Date },
});

GlobalStats.attachSchema(GlobalStats.schema);

GlobalStats.lastCollectionCount = collectionName => {
  check(collectionName, String);
  const lastDataPoint = GlobalStats.findOne(
    { name: `${collectionName}.count` },
    { sort: { date: -1 } },
  );
  return lastDataPoint && lastDataPoint.value;
};
