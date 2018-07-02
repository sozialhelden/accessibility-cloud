import {PlaceInfos} from '../place-infos';

import categoryFilterSelector from './category-selector';
import organizationFilterSelector from './organization-selector';

import distanceSearchSelector from '../../shared/server/distance-search';
import mapTileSelector from '../../shared/server/map-tile';
import sourceFilterSelector from '../../shared/server/source-filter';
import filterPresetSelector from '../../shared/server/filter-preset';
import originalIdSelector from '../../shared/server/original-id';
import existingAccessibilitySelector from '../../shared/server/existing-accessibility';

PlaceInfos.apiParameterizedSelector = (visibleContentSelector, req, _id) => ({
  $and: [
    mapTileSelector(req),
    visibleContentSelector,
    existingAccessibilitySelector(req, _id),
    filterPresetSelector(req),
    sourceFilterSelector(req),
    originalIdSelector(req),
    distanceSearchSelector(req),
    categoryFilterSelector(req),
    organizationFilterSelector(req)
  ].filter(s => Object.keys(s).length > 0)
});
