import { Sources } from '../../sources/sources';
import { Disruptions } from '../../disruptions/disruptions';
import { EquipmentInfos } from '../../equipment-infos/equipment-infos';
import { PlaceInfos } from '../../place-infos/place-infos';

import convertToGeoJSONFeature from '../../shared/convertToGeoJSONFeature';
import wrapAPIResponseAsGeoJSON from '../../shared/server/wrapAPIResponseAsGeoJSON';

Disruptions.convertToGeoJSONFeature = convertToGeoJSONFeature;
Disruptions.wrapAPIResponse = wrapAPIResponseAsGeoJSON;

Disruptions.relationships = {
  belongsTo: {
    source: {
      foreignCollection: Sources,
      foreignKey: 'properties.sourceId',
    },
    equipmentInfo: {
      foreignCollection: EquipmentInfos,
      foreignKey: 'properties.equipmentInfoId',
    },
    placeInfo: {
      foreignCollection: PlaceInfos,
      foreignKey: 'properties.placeInfoId',
    },
  },
};

Disruptions.includePathsByDefault = ['source.license'];
