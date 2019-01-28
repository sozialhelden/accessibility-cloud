import { check } from 'meteor/check';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { isAdmin } from '/both/lib/is-admin';
import { Disruptions } from '../disruptions/disruptions';
import { EquipmentInfos } from '../equipment-infos/equipment-infos';
import { PlaceInfos } from '../place-infos/place-infos';
import { Meteor } from 'meteor/meteor';
import exploreAttributesTree from '../sources/server/attribute-distribution';

export const GlobalStats = new Mongo.Collection('GlobalStats');
export const GlobalAttributeStats = new Mongo.Collection('GlobalAttributeStats');

GlobalStats.schema = new SimpleSchema({
  name: { type: String },
  value: { type: Number },
  date: { type: Date },
});

GlobalStats.attachSchema(GlobalStats.schema);

GlobalStats.lastCollectionCount = (collectionName) => {
  check(collectionName, String);
  const lastDataPoint = GlobalStats.findOne(
    { name: `${collectionName}.count` },
    { sort: { date: -1 } },
  );
  return lastDataPoint && lastDataPoint.value;
};

Meteor.methods({
  calculateGlobalAttributeStats() {
    if (!this.userId) {
      throw new Meteor.Error(401, 'Please log in first.');
    }
    if (!isAdmin(this.userId)) {
      throw new Meteor.Error(403, 'Not authorized');
    }

    const attributeDistribution = {};

    const startDate = new Date();
    let documentCount = 0;

    [Disruptions, EquipmentInfos, PlaceInfos].forEach((collection) => {
      const selector = { };
      const cursor = collection.find(
        selector,
        { transform: null },
      );
      const count = cursor.count();
      console.log(`Analysing ${count} documents in ${collection._name} collection (Selector: ${JSON.stringify(selector)})...`);
      documentCount += count;
      cursor.forEach((doc) => {
        exploreAttributesTree('properties', doc, attributeDistribution);
      });
    });

    const seconds = 0.001 * (new Date() - startDate);

    console.log(
      'Analysed',
      documentCount,
      `documents in ${seconds} seconds (${documentCount / seconds} docs/second).`,
    );

    // Uncomment this for debugging
    // console.log(
    //   'attributeDistribution:', util.inspect(attributeDistribution, { depth: 10, colors: true })
    // );

    GlobalAttributeStats.insert({ date: new Date(), attributeDistribution, documentCount });
  },
});
