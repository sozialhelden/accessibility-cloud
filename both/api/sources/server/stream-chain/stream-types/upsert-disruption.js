import includes from 'lodash/includes';
import { Meteor } from 'meteor/meteor';

import { PlaceInfos } from '../../../../place-infos/place-infos';
import { EquipmentInfos } from '../../../../equipment-infos/equipment-infos';
import { Disruptions } from '../../../../disruptions/disruptions';

import Upsert from './upsert';


export default class UpsertDisruption extends Upsert {
  constructor(options) {
    super(options);
    this.stream.unitName = 'disruptions';
  }

  // Associate the disruption information with a place data source and equipment info, if possible

  postProcessBeforeUpserting(doc, { organizationSourceIds, organizationName }) {
    const result = super.postProcessBeforeUpserting(doc);
    const properties = result.properties;
    if (!properties) return result;

    const placeSourceId = properties.placeSourceId;
    if (placeSourceId) {
      if (!includes(organizationSourceIds, placeSourceId)) {
        const message = `Not authorized: placeSourceId must refer to a data source by ${organizationName} (Allowed: ${organizationSourceIds}, given: ${placeSourceId})`;
        throw new Meteor.Error(401, message);
      }

      if (properties.originalPlaceInfoId) {
        const selector = { 'properties.sourceId': placeSourceId, 'properties.originalId': properties.originalPlaceInfoId };
        const options = { transform: null, fields: { _id: true, geometry: true } };
        const placeInfo = PlaceInfos.findOne(selector, options);
        console.log('Found place association', placeInfo, 'for', selector);
        if (placeInfo) {
          result.properties.placeInfoId = placeInfo._id;
          result.geometry = result.geometry || placeInfo.geometry;
        }
      }
    }

    const equipmentSourceId = properties.equipmentSourceId;
    if (equipmentSourceId) {
      if (!includes(organizationSourceIds, equipmentSourceId)) {
        const message = `Not authorized: equipmentSourceId must refer to a data source by ${organizationName} (Allowed: ${organizationSourceIds}, given: ${equipmentSourceId})`;
        throw new Meteor.Error(401, message);
      }

      if (properties.originalEquipmentInfoId) {
        const selector = { 'properties.sourceId': equipmentSourceId, 'properties.originalId': properties.originalEquipmentInfoId };
        const options = { transform: null, fields: { _id: true, geometry: true } };
        const equipmentInfo = EquipmentInfos.findOne(selector, options);
        console.log('Found equipment association', equipmentInfo, 'for', selector);
        if (equipmentInfo) {
          result.properties.equipmentInfoId = equipmentInfo._id;
          result.geometry = result.geometry || equipmentInfo.geometry;
        }
      }
    }

    return result;
  }
}

UpsertDisruption.collection = Disruptions;
