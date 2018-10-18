import { Categories } from '../../../../both/api/categories/categories';
import { makeCollectionTranslatable, defaultAttributePathFn, defaultMsgidFn } from '../../../../server/i18n/translatable-collection';

makeCollectionTranslatable(Categories, [{
  attributeName: '_id',
  attributePathFn: defaultAttributePathFn,
  msgidFn: defaultMsgidFn,
}]);
