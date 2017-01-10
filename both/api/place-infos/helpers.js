import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/stevezhu:lodash';
if (Meteor.isServer) {
  import { pathsInObject, getTranslationForAccessibilityAttribute }
    from '/server/i18n/ac-format-translations';
}
import { Categories } from '/both/api/categories/categories';

const helpers = {
  getLocalizedCategory(locale) {
    const category = Categories.findOne(this.properties.category);
    return category.getLocalizedId(locale);
  },
  getLocalizedAccessibility(locale) {
    const result = _.cloneDeep(this.properties.accessibility);
    const paths = pathsInObject(result);
    paths.forEach(path => {
      _.set(result, `${path}Localized`, getTranslationForAccessibilityAttribute(path, locale));
    });
    return result;
  },
};

export default helpers;
