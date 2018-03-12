import { PlaceInfos } from '../place-infos';

import categoryFilterSelector from './category-selector';

import distanceSearchSelector from '../../shared/server/distance-search';
import mapTileSelector from '../../shared/server/map-tile';
import sourceFilterSelector from '../../shared/server/source-filter';
import filterPresetSelector from '../../shared/server/filter-preset';
import originalIdSelector from '../../shared/server/original-id';


PlaceInfos.apiParameterizedSelector = (visibleContentSelector, req) =>
  ({
    $and: [
      mapTileSelector(req),
      visibleContentSelector,
      filterPresetSelector(req),
      sourceFilterSelector(req),
      originalIdSelector(req),
      distanceSearchSelector(req),
      categoryFilterSelector(req),
    ].filter(s => Object.keys(s).length > 0),
  });
