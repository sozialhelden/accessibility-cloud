import { Sources } from '../../../../both/api/sources/sources';
import { makeCollectionTranslatable, defaultAttributePathFn, defaultMsgidFn } from '../../../../server/i18n/translatable-collection';

makeCollectionTranslatable(Sources, [{
  attributeName: 'additionalAccessibilityInformation',
  attributePathFn: defaultAttributePathFn,
  msgidFn: defaultMsgidFn,
}]);
