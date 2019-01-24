import get from 'lodash/get';
import { EquipmentInfos } from '../equipment-infos';
import tileSurrogateKeysForFeature from '../../shared/tile-indexing/tileSurrogateKeysForFeature';

EquipmentInfos.surrogateKeysForDocument = placeInfo =>
  [
    get(placeInfo, ['properties', 'sourceId']),
    get(placeInfo, ['properties', 'sourceImportId']),
  ]
  .filter(Boolean)
  .concat(tileSurrogateKeysForFeature(placeInfo));

EquipmentInfos.maximalCacheTimeInSeconds = 60 * 60 * 24 * 7;
