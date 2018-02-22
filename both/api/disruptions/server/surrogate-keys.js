import get from 'lodash/get';
import { Disruptions } from '../disruptions';

Disruptions.surrogateKeysForDocument = placeInfo =>
  [
    get(placeInfo, ['properties', 'sourceId']),
    get(placeInfo, ['properties', 'sourceImportId']),
  ].filter(Boolean);

Disruptions.maximalCacheTimeInSeconds = 300;
