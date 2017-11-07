import { EquipmentInfos } from '../equipment-infos';

import { distanceSearchSelector } from '../../shared/server/distance-search';
import { mapTileSelector } from '../../shared/server/map-tile';
import { sourceFilterSelector } from '../../shared/server/source-filter';
import { filterPresetSelector } from '../../shared/server/filter-preset';


EquipmentInfos.apiParameterizedSelector = (visibleContentSelector, req) =>
  ({
    $and: [
      sourceFilterSelector(req),
      visibleContentSelector,
      distanceSearchSelector(req),
      mapTileSelector(req),
      filterPresetSelector(req),
    ].filter(s => Object.keys(s).length > 0),
  });
