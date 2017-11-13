import { EquipmentInfos } from '../../equipment-infos/equipment-infos';
import convertToGeoJSONFeature from '../../shared/convertToGeoJSONFeature';
import wrapAPIResponseAsGeoJSON from '../../shared/server/wrapAPIResponseAsGeoJSON';

EquipmentInfos.convertToGeoJSONFeature = convertToGeoJSONFeature;
EquipmentInfos.wrapAPIResponse = wrapAPIResponseAsGeoJSON;
EquipmentInfos.includePathsByDefault = ['source.license'];
