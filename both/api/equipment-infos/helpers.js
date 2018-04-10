import find from 'lodash/find';
import { Disruptions } from '../disruptions/disruptions';
import { EquipmentInfos } from './equipment-infos';
import { PlaceInfos } from '../place-infos/place-infos';

const helpers = {
  isWorking() {
    if (!this.properties) return null;
    if (typeof this.properties.isWorking === 'boolean') return this.properties.isWorking;
    const disruptions = this.getDisruptions().fetch();
    return !find(disruptions, disruption => disruption.isEquipmentWorking() === false);
  },

  getDisruptions() {
    return Disruptions.find({ 'properties.equipmentInfoId': this._id });
  },

  cachePlaceInfo(callback) {
    const properties = this.properties;
    if (!properties) {
      callback(null, this);
      return;
    }

    const placeSourceId = properties.placeSourceId;

    if (!placeSourceId) {
      callback(null, this);
      return;
    }

    if (properties.originalPlaceInfoId) {
      const placeInfoSelector = { 'properties.sourceId': placeSourceId, 'properties.originalId': properties.originalPlaceInfoId };
      const equipmentInfo = EquipmentInfos.findOne(
        { 'properties.originalId': properties.originalId },
        { transform: null, fields: { statusReportToken: false, 'properties.originalData': false } },
      );

      if (equipmentInfo) {
        console.log('Caching', this, equipmentInfo, placeInfoSelector);
        // Cache equipment information in PlaceInfo document
        PlaceInfos.update(placeInfoSelector, {
          $set: {
            [`properties.equipmentInfos.${equipmentInfo._id}`]: equipmentInfo,
          },
        });
      }
    }
  }
};

export default helpers;
