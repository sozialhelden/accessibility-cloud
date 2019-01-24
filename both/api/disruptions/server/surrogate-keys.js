import get from 'lodash/get';
import { Disruptions } from '../disruptions';
import tileSurrogateKeysForFeature from '../../shared/tile-indexing/tileSurrogateKeysForFeature';

Disruptions.surrogateKeysForDocument = placeInfo =>
  [
    get(placeInfo, ['properties', 'sourceId']),
    get(placeInfo, ['properties', 'sourceImportId']),
  ]
  .filter(Boolean)
  .concat(tileSurrogateKeysForFeature(placeInfo));

Disruptions.maximalCacheTimeInSeconds = 60 * 60 * 24 * 7;
