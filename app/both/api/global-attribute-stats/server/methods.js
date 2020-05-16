import { Meteor } from 'meteor/meteor';
import { isAdmin } from '../../../lib/is-admin';
import exploreAttributesTree from '../../sources/server/attribute-distribution';
import { Disruptions } from '../../disruptions/disruptions';
import { EquipmentInfos } from '../../equipment-infos/equipment-infos';
import { PlaceInfos } from '../../place-infos/place-infos';
import { GlobalAttributeStats } from '../global-attribute-stats';

Meteor.methods({
  'GlobalAttributeStats.calculate'() {
    if (!this.userId) {
      throw new Meteor.Error(401, 'Please log in first.');
    }
    if (!isAdmin(this.userId)) {
      throw new Meteor.Error(403, 'Not authorized');
    }

    this.unblock();

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
      documentCount += count;
      const selectorString = JSON.stringify(selector);
      const collectionName = collection._name;
      const batchSize = 10000;
      let timestamp = Date.now();
      cursor.forEach((doc, i) => {
        if (i % batchSize === 0) {
          const now = Date.now();
          const batchDuration = (now - timestamp) / 1000;
          timestamp = Date.now();
          if (i) {
            console.log(`Analysed ${i} / ${count} ${collectionName} (${Math.round(batchSize / batchDuration)} per second)`);
          } else {
            console.log(`Analysing ${collectionName} ${selectorString}…`);
          }
        }
        exploreAttributesTree('properties', doc, attributeDistribution);
      });
    });

    const seconds = 0.001 * (new Date() - startDate);
    console.log(
      'Analysed', documentCount, `documents in ${seconds} seconds (${Math.round(documentCount / seconds)} docs/second).`,
    );

    // Uncomment this for debugging
    // console.log(
    //   'attributeDistribution:', util.inspect(attributeDistribution, { depth: 10, colors: true }),
    // );

    GlobalAttributeStats.insert({
      documentCount,
      date: new Date(),
      attributeDistribution: JSON.stringify(attributeDistribution),
    });
  },
});
