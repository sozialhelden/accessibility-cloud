import get from 'lodash/get';
import { PlaceInfos } from '../place-infos';

PlaceInfos.surrogateKeysForDocument = placeInfo =>
  [
    get(placeInfo, ['properties', 'sourceId']),
    get(placeInfo, ['properties', 'sourceImportId']),
  ].filter(Boolean);

PlaceInfos.maximalCacheTimeInSeconds = 1200;
