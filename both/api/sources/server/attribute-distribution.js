import set from 'lodash/set';
import isObject from 'lodash/isObject';
import get from 'lodash/get';

const attributeBlacklist = {
  properties: {
    _id: true,
    equipmentInfos: true,
    properties: {
      infoPageUrl: true,
      placeWebsiteUrl: true,
      editPageUrl: true,
      lastSourceImportId: true,
      sourceId: true,
      originalId: true,
      originalData: true,
      address: true,
      phoneNumber: true,
      phone: true, // legacy
      emailAddress: true,
      email: true, // legacy
      name: true,
      lastUpdate: true,
      description: true,
      longDescription: true,
      shortDescription: true,
      outOfServiceReason: true,
      furtherDescription: true,

    },
    lastDisruptionProperties: true,
    geometry: true,
  },
};

// Goes through all attributes of a document recursively
// and increments the according values in `attributeDistribution`
// to calculate each attribute value's frequency in the whole dataset.

export default function exploreAttributesTree(
  rootKey,
  valueOrAttributes,
  attributeDistribution,
) {
  if (!isObject(attributeDistribution)) {
    throw new Error('Must supply an object to save attribute distribution');
  }
  if (get(attributeBlacklist, rootKey) === true) {
    return;
  }
  if (rootKey.match(/Id$/i)) return attributeDistribution;
  if (isObject(valueOrAttributes)) {
    Object.keys(valueOrAttributes).forEach((key) => {
      const childKey = rootKey ? (`${rootKey}.${key}`) : key;
      exploreAttributesTree(childKey, valueOrAttributes[key], attributeDistribution);
    });
    return;
  }
  let distribution = get(attributeDistribution, rootKey);
  if (!distribution) {
    distribution = {};
    set(attributeDistribution, rootKey, distribution);
  }
  const value = valueOrAttributes;
  distribution[value] = (distribution[value] || 0) + 1;
}
