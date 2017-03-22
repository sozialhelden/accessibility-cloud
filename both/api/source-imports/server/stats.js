// import util from 'util';
import { PlaceInfos } from '/both/api/place-infos/place-infos.js';
import { SourceImports } from '/both/api/source-imports/source-imports.js';
import { Sources } from '/both/api/sources/sources.js';
import { _ } from 'lodash';
import { calculateGlobalStats } from '/both/api/global-stats/server/calculation';

const attributeBlacklist = {
  properties: {
    _id: true,
    properties: {
      infoPageUrl: true,
      placeWebsiteUrl: true,
      sourceId: true,
      originalId: true,
      originalData: true,
      address: true,
      name: true,
    },
    geometry: true,
  },
};

SourceImports.helpers({
  generateAndSaveStats() {
    const attributeDistribution = {};

    // Goes through all attributes of a `PlaceInfo` object recursively
    // and increments the according values in `attributeDistribution` to calculate
    // each attribute value's frequency in the whole dataset.
    function exploreAttributesTree(rootKey, valueOrAttributes) {
      if (_.get(attributeBlacklist, rootKey) === true) {
        return;
      }
      if (_.isObject(valueOrAttributes)) {
        Object.keys(valueOrAttributes).forEach(key => {
          const childKey = rootKey ? (`${rootKey}.${key}`) : key;
          exploreAttributesTree(childKey, valueOrAttributes[key]);
        });
        return;
      }
      let distribution = _.get(attributeDistribution, rootKey);
      if (!distribution) {
        distribution = {};
        _.set(attributeDistribution, rootKey, distribution);
      }
      const value = valueOrAttributes;
      distribution[value] = (distribution[value] || 0) + 1;
    }

    const placeInfos = PlaceInfos.find(
      { 'properties.sourceId': this.sourceId },
      { transform: null }
    );

    const placeInfoCount = placeInfos.count();
    console.log('Analysing', placeInfoCount, 'PoIs...');
    const startDate = new Date();

    placeInfos.forEach(placeInfo => {
      exploreAttributesTree('properties', placeInfo);
    });

    const seconds = 0.001 * (new Date() - startDate);
    console.log(
      'Analysed',
      placeInfoCount,
      `PoIs in ${seconds} seconds (${placeInfoCount / seconds} PoIs/second).`
    );

    // Uncomment this for debugging
    // console.log(
    //   'attributeDistribution:', util.inspect(attributeDistribution, { depth: 10, colors: true })
    // );

    const attributesToSet = {
      attributeDistribution: JSON.stringify(attributeDistribution),
      placeInfoCountAfterImport: placeInfoCount,
    };

    const upsertStream = this.upsertStream();
    if (upsertStream) {
      if (upsertStream.debugInfo) {
        ['insertedPlaceInfoCount', 'updatedPlaceInfoCount'].forEach(attributeName => {
          attributesToSet[attributeName] = upsertStream.debugInfo[attributeName];
        });
      }
      if (upsertStream.progress) {
        attributesToSet.processedPlaceInfoCount = upsertStream.progress.transferred;
      }
    }

    SourceImports.update(this._id, {
      $set: attributesToSet,
    });

    Sources.update(this.sourceId, { $set: { placeInfoCount } });

    calculateGlobalStats();

    return attributeDistribution;
  },
});
