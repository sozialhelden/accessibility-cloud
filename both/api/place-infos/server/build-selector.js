import { PlaceInfos } from '../place-infos';

import categoryFilterSelector from './category-selector';

import distanceSearchSelector from '../../shared/server/distance-search';
import mapTileSelector from '../../shared/tile-indexing/mapTileSelector';
import sourceFilterSelector from '../../shared/server/source-filter';
import filterPresetSelector from '../../shared/server/filter-preset';
import originalIdSelector from '../../shared/server/original-id';
import existingAccessibilitySelector from '../../shared/server/existing-accessibility';


PlaceInfos.apiParameterizedSelector = ({ visibleContentSelector, req, _id, surrogateKeys }) =>
  ({
    $and: [
      filterPresetSelector(req),
      existingAccessibilitySelector(req, _id),
      sourceFilterSelector(req),
      visibleContentSelector,
      originalIdSelector(req),
      categoryFilterSelector(req),
      mapTileSelector({ req, surrogateKeys }),
      distanceSearchSelector({ req, surrogateKeys }),
    ].filter(s => Object.keys(s).length > 0),
  });
