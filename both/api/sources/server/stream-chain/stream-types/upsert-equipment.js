import includes from 'lodash/includes';
import pick from 'lodash/pick';
import { Meteor } from 'meteor/meteor';

import { EquipmentInfos } from '../../../../../api/equipment-infos/equipment-infos';
import { PlaceInfos } from '../../../../../api/place-infos/place-infos';

import Upsert from './upsert';


export function cacheEquipmentInPlaceInfo({
  originalId,
  placeSourceId,
  originalPlaceInfoId,
  organizationSourceIds,
}) {
  if (!includes(organizationSourceIds, placeSourceId)) {
    const message = `Not authorized: placeSourceId ${placeSourceId} does not refer to a data source by the same organization.`;
    throw new Meteor.Error(401, message);
  }

  console.log('Caching equipment info in place info...');

  if (originalPlaceInfoId) {
    const placeInfoSelector = { 'properties.sourceId': placeSourceId, 'properties.originalId': originalPlaceInfoId };
    // Re-fetch equipment info from DB without disallowed attributes
    const completeEquipmentInfo = EquipmentInfos.findOne(
      { 'properties.originalId': originalId },
      { transform: null, fields: { 'properties.originalData': false } },
    );
    if (completeEquipmentInfo) {
      const equipmentInfo = pick(completeEquipmentInfo, ['_id'].concat(Object.keys(EquipmentInfos.publicFields)));
      const placeInfoModifier = {
        $set: {
          [`properties.equipmentInfos.${equipmentInfo._id}`]: equipmentInfo,
        },
      };
      console.log('Caching', equipmentInfo, placeInfoSelector, placeInfoModifier);
      // Cache equipment information in PlaceInfo document
      PlaceInfos.update(placeInfoSelector, placeInfoModifier);
    }
  }
}


export default class UpsertEquipmentInfo extends Upsert {
  constructor(options) {
    super(options);
    this.stream.unitName = 'equipment infos';
  }

  // Associate the equipment information with a place data source, if possible

  postProcessBeforeUpserting(doc, { organizationSourceIds, organizationName }) {
    const result = super.postProcessBeforeUpserting(doc);

    const properties = result.properties;
    if (!properties) return result;

    const placeSourceId = properties.placeSourceId;

    if (placeSourceId) {
      if (!includes(organizationSourceIds, placeSourceId)) {
        const message = `Not authorized: placeSourceId must refer to a data source by ${organizationName}`;
        throw new Meteor.Error(401, message);
      }
      if (properties.originalPlaceInfoId) {
        const originalPlaceInfoIdField = properties.originalPlaceInfoIdField || 'properties.originalId';
        const selector = { 'properties.sourceId': placeSourceId, [originalPlaceInfoIdField]: properties.originalPlaceInfoId };
        const options = { transform: null, fields: { _id: true, geometry: true } };
        const placeInfo = PlaceInfos.findOne(selector, options);
        console.log('Associating equipment with place', placeInfo, 'matching', selector);
        if (placeInfo) {
          result.properties.placeInfoId = placeInfo._id;
          result.geometry = result.geometry || placeInfo.geometry;
        }
      }
    }
    return result;
  }


  // Associate the equipment information with a place data source, if possible
  afterUpsert({ doc, organizationSourceIds, organizationName }, callback) {
    const result = doc;

    const properties = doc.properties;
    if (!properties) {
      callback(null, doc);
      return;
    }

    const { originalId, placeSourceId, originalPlaceInfoId } = properties;

    if (!placeSourceId) {
      callback(null, doc);
      return;
    }

    cacheEquipmentInPlaceInfo({
      originalId,
      placeSourceId,
      originalPlaceInfoId,
      organizationSourceIds,
      organizationName,
    });

    callback(null, doc);
  }
}

UpsertEquipmentInfo.collection = EquipmentInfos;

