import { EquipmentInfos } from '../../equipment-infos/equipment-infos';
import convertToGeoJSONFeature from '../../shared/convertToGeoJSONFeature';
import wrapCollectionAPIResponseAsGeoJSON from '../../shared/server/wrapCollectionAPIResponseAsGeoJSON';

EquipmentInfos.convertToGeoJSONFeature = convertToGeoJSONFeature;
EquipmentInfos.wrapCollectionAPIResponse = wrapCollectionAPIResponseAsGeoJSON;
EquipmentInfos.includePathsByDefault = ['source.license'];
