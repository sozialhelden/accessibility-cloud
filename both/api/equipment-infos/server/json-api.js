import { Sources } from '../../sources/sources';
import { EquipmentInfos } from '../../equipment-infos/equipment-infos';
import {
  convertToGeoJSONFeature,
  wrapAPIResponseAsGeoJSON,
} from '../../shared/server/geo-json-conversion';

EquipmentInfos.convertToGeoJSONFeature = convertToGeoJSONFeature;
EquipmentInfos.wrapAPIResponse = wrapAPIResponseAsGeoJSON;

EquipmentInfos.relationships = {
  belongsTo: {
    source: {
      foreignCollection: Sources,
      foreignKey: 'properties.sourceId',
    },
  },
};

EquipmentInfos.includePathsByDefault = ['source.license'];
