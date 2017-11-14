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
        console.log('Found association', placeInfo, 'for', selector);
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
        console.log('Found association', equipmentInfo, 'for', selector);
        if (equipmentInfo) {
          result.properties.equipmentInfoId = equipmentInfo._id;
          result.geometry = result.geometry || equipmentInfo.geometry;
        }
      }
    }

    return result;
  }


  static updateEquipmentSelectorAndModifier(disruption) {
    if (!disruption) return {};
    const equipmentInfoId = disruption.equipmentInfoId;
    if (!equipmentInfoId) return {};
    const selector = equipmentInfoId;
    const { outOfServiceOn, outOfServiceTo } = disruption;
    const now = Date.now();
    const fromDate = outOfServiceOn ? new Date(outOfServiceOn) : 0;
    const toDate = outOfServiceTo ? new Date(outOfServiceTo) : 0;
    const isOutOfService = fromDate &&
      toDate &&
      (!fromDate || now >= +fromDate) && (!toDate || now <= +toDate);

    const modifier = { isWorking: !isOutOfService }

    return { selector, modifier };
  }

  afterUpsert(disruption, callback) {
    const { selector, modifier } = this.constructor.updateEquipmentSelectorAndModifier(disruption);

    if (!selector || !modifier) {
      callback(null);
      return;
    }

    this.upsert(PlaceInfos, selector, modifier, callback);
  }
}

UpsertDisruption.collection = Disruptions;
