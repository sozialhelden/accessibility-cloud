import util from 'util';
import { PlaceInfos } from '/both/api/place-infos/place-infos.js';
import { SourceImports } from '/both/api/source-imports/source-imports.js';
import { _ } from 'lodash';

const blacklist = {
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

    function explore(rootKey, valueOrAttributes) {
      if (_.get(blacklist, rootKey) === true) {
        return;
      }
      if (_.isObject(valueOrAttributes)) {
        Object.keys(valueOrAttributes).forEach(key => {
          // eslint-disable-next-line prefer-template
          const childKey = rootKey ? (rootKey + '.' + key) : key;
          explore(childKey, valueOrAttributes[key]);
        });
        return;
      }
      const distribution = _.get(attributeDistribution, rootKey) || {};
      _.set(attributeDistribution, rootKey, distribution);
      const value = valueOrAttributes;
      distribution[value] = (distribution[value] || 0) + 1;
    }

    const placeInfos = PlaceInfos.find(
      { 'properties.sourceId': this.sourceId },
      { transform: null }
    ).fetch();
    console.log('Analysing', placeInfos.length, 'PoIs...');
    placeInfos.forEach(placeInfo => {
      explore('properties', placeInfo);
    });

    console.log('attributeDistribution:', util.inspect(attributeDistribution, { depth: 10, colors: true }));

    SourceImports.update(this._id, {
      $set: {
        attributeDistribution: JSON.stringify(attributeDistribution),
      },
    });


    return attributeDistribution;
  },
});
