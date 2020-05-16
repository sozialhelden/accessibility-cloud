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
};

export default helpers;
