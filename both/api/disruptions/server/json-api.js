import { Sources } from '../../sources/sources';
import { Disruptions } from '../../disruptions/disruptions';
import { EquipmentInfos } from '../../equipment-infos/equipment-infos';
import { PlaceInfos } from '../../place-infos/place-infos';

import convertToGeoJSONFeature from '../../shared/convertToGeoJSONFeature';
import wrapCollectionAPIResponseAsGeoJSON from '../../shared/server/wrapCollectionAPIResponseAsGeoJSON';

Disruptions.convertToGeoJSONFeature = convertToGeoJSONFeature;
Disruptions.wrapCollectionAPIResponse = wrapCollectionAPIResponseAsGeoJSON;

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
