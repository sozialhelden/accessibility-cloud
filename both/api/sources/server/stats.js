// import util from 'util';
import { PlaceInfos } from '/both/api/place-infos/place-infos';
import { Disruptions } from '/both/api/disruptions/disruptions';
import { EquipmentInfos } from '/both/api/equipment-infos/equipment-infos';
import { Sources } from '/both/api/sources/sources';
import exploreAttributesTree from './attribute-distribution';
import { calculateGlobalStats } from '/both/api/global-stats/server/calculation';


Sources.helpers({
  getAttributeDistribution() {
    const attributeDistribution = {};

    const startDate = new Date();
    let documentCount = 0;

    [Disruptions, EquipmentInfos, PlaceInfos].forEach((collection) => {
      const selector = { 'properties.sourceId': this._id };
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

    return { attributeDistribution, documentCount };
  },

  generateAndSaveStats(options) {
    const { attributeDistribution, documentCount } = this.getAttributeDistribution();

    console.log(this._id, { attributeDistribution, documentCount });

    Sources.update(this._id, { $set: {
      documentCount,
      attributeDistribution: JSON.stringify(attributeDistribution),
    } });

    if (!options || !options.skipGlobalStats) {
      calculateGlobalStats();
    }

    return attributeDistribution;
  },
});
