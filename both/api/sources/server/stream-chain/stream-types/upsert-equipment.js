import includes from 'lodash/includes';
import { Meteor } from 'meteor/meteor';

import { EquipmentInfos } from '../../../../../api/equipment-infos/equipment-infos';
import { PlaceInfos } from '../../../../../api/place-infos/place-infos';

import Upsert from './upsert';


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
        const selector = { 'properties.sourceId': placeSourceId, 'properties.originalId': properties.originalPlaceInfoId };
        const options = { transform: null, fields: { _id: true, geometry: true } };
        const placeInfo = PlaceInfos.findOne(selector, options);
        if (placeInfo) {
          result.properties.placeInfoId = placeInfo._id;
          result.geometry = result.geometry || placeInfo.geometry;
        }
      }
    }
    return result;
  }
}

UpsertEquipmentInfo.collection = EquipmentInfos;
