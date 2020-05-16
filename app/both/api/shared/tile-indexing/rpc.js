import { PlaceInfos } from '../../place-infos/place-infos';
import { EquipmentInfos } from '../../equipment-infos/equipment-infos';
import { Disruptions } from '../../disruptions/disruptions';

import { isAdmin } from '../../../lib/is-admin';

import regenerateTileCoordinatesIndexOnCollection
  from './regenerateTileCoordinatesIndexOnCollection';

Meteor.methods({
  regenerateTileIndexes() {
    if (!this.userId) {
      throw new Meteor.Error(401, 'Please log in first.');
    }
    if (!isAdmin(this.userId)) {
      throw new Meteor.Error(403, 'You are not authorized to import categories.');
    }

    this.unblock();

    regenerateTileCoordinatesIndexOnCollection(Disruptions);
    regenerateTileCoordinatesIndexOnCollection(EquipmentInfos);
    regenerateTileCoordinatesIndexOnCollection(PlaceInfos);
  },
});
