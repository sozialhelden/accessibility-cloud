import { EquipmentInfos } from '../../equipment-infos/equipment-infos';
import convertToGeoJSONFeature from '../../shared/convertToGeoJSONFeature';
import wrapCollectionAPIResponseAsGeoJSON from '../../shared/server/wrapCollectionAPIResponseAsGeoJSON';

EquipmentInfos.convertToJSON = convertToGeoJSONFeature;
EquipmentInfos.wrapCollectionAPIResponse = wrapCollectionAPIResponseAsGeoJSON;
EquipmentInfos.includePathsByDefault = ['source.license'];
