import util from 'util';
import { PlaceInfos } from '/both/api/place-infos/place-infos.js';
import { SourceImports } from '/both/api/source-imports/source-imports.js';
import { _ } from 'lodash';

const attributeBlacklist = {
  properties: {
    _id: true,
    properties: {
      infoPageUrl: true,
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

    const numberOfPlaces = placeInfos.count();
    console.log('Analysing', numberOfPlaces, 'PoIs...');
    const startDate = new Date();

    placeInfos.forEach(placeInfo => {
      exploreAttributesTree('properties', placeInfo);
    });

    const seconds = 0.001 * (new Date() - startDate);
    console.log(
      'Analysed',
      numberOfPlaces,
      `PoIs in ${seconds} seconds (${numberOfPlaces / seconds} PoIs/second).`
    );

    // Uncomment this for debugging
    // console.log(
    //   'attributeDistribution:', util.inspect(attributeDistribution, { depth: 10, colors: true })
    // );

    SourceImports.update(this._id, {
      $set: {
        attributeDistribution: JSON.stringify(attributeDistribution),
      },
    });

    return attributeDistribution;
  },
});
