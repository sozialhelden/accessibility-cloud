import { EquipmentInfos } from '../equipment-infos';

import distanceSearchSelector from '../../shared/server/distance-search';
import mapTileSelector from '../../shared/tile-indexing/mapTileSelector';
import sourceFilterSelector from '../../shared/server/source-filter';
import filterPresetSelector from '../../shared/server/filter-preset';
import originalIdSelector from '../../shared/server/original-id';

EquipmentInfos.apiParameterizedSelector = ({ visibleContentSelector, req, surrogateKeys }) =>
  ({
    $and: [
      sourceFilterSelector(req),
      visibleContentSelector,
      originalIdSelector(req),
      distanceSearchSelector({ req, surrogateKeys }),
      mapTileSelector({ req, surrogateKeys }),
      filterPresetSelector(req),
    ].filter(s => Object.keys(s).length > 0),
  });
