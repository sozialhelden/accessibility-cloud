import get from 'lodash/get';
import { PlaceInfos } from '../place-infos';
import tileSurrogateKeysForFeature from '../../shared/tile-indexing/tileSurrogateKeysForFeature';

PlaceInfos.surrogateKeysForDocument = placeInfo =>
  [
    get(placeInfo, ['properties', 'sourceId']),
    get(placeInfo, ['properties', 'sourceImportId']),
  ]
  .filter(Boolean)
  .concat(tileSurrogateKeysForFeature(placeInfo));

PlaceInfos.maximalCacheTimeInSeconds = 60 * 60 * 24 * 7;
