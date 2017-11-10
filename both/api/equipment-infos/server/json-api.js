import { Sources } from '../../sources/sources';
import { EquipmentInfos } from '../../equipment-infos/equipment-infos';
import convertToGeoJSONFeature from '../../shared/convertToGeoJSONFeature';
import wrapAPIResponseAsGeoJSON from '../../shared/server/wrapAPIResponseAsGeoJSON';

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
