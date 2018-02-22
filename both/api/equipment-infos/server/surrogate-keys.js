import get from 'lodash/get';
import { EquipmentInfos } from '../equipment-infos';

EquipmentInfos.surrogateKeysForDocument = placeInfo =>
  [
    get(placeInfo, ['properties', 'sourceId']),
    get(placeInfo, ['properties', 'sourceImportId']),
  ].filter(Boolean);

EquipmentInfos.maximalCacheTimeInSeconds = 300;
