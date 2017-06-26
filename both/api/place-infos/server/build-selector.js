import { PlaceInfos } from '../place-infos';

import { distanceSearchSelector } from './distance-search';
import { mapTileSelector } from './map-tile';
import { sourceFilterSelector } from './source-filter.js';
import { filterPresetSelector } from './filter-preset';


PlaceInfos.apiParameterizedSelector = (visibleContentSelector, req) =>
  ({
    $and: [
      sourceFilterSelector(req),
      visibleContentSelector,
      distanceSearchSelector(req),
      mapTileSelector(req),
      filterPresetSelector(req),
    ].filter(s => Object.keys(s).length > 0),
  });
