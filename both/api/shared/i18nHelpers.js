import { cloneDeep, set } from 'lodash';
import {
  pathsInObject,
  getTranslationForAccessibilityAttributeName,
} from '/both/i18n/ac-format-translations';
import { Categories } from '/both/api/categories/categories';

const i18nHelpers = {
  getLocalizedCategory(locale) {
    if (!this.properties) return '';
    const category = Categories.findOne(this.properties.category);
    if (!category) {
      // console.log(`Category ${this.properties.category} not found.`);
      return '';
    }
    return category.getLocalizedId(locale);
  },
  getLocalizedAccessibility(locale) {
    const result = cloneDeep(this.properties.accessibility);
    const paths = pathsInObject(result);
    paths.forEach((path) => {
      set(result, `${path}Localized`, getTranslationForAccessibilityAttributeName(path, locale));
    });
    return result;
  },
  getLocalizedName(requestedLocale) {
    if (requestedLocale && !(typeof requestedLocale === 'string')) throw new Meteor.Error(422, 'Locale must be undefined or a string.');
    if (!requestedLocale) return this.properties ? this.properties.name : null;
    const sanitizedRequestedLocale = requestedLocale.replace('-', '_');
    if (!this.properties) return null;
    if (typeof this.properties.name === 'string') return this.properties.name;
    if (typeof this.properties.name === 'object') {
      const localeWithoutCountry = sanitizedRequestedLocale.slice(0, 2);
      const firstAvailableLocale = Object.keys(this.properties.name)[0];
      const foundLocale = [sanitizedRequestedLocale, localeWithoutCountry, 'en_US', 'en', firstAvailableLocale].find(locale => typeof this.properties.name[locale] === 'string');
      if (foundLocale) return this.properties.name[foundLocale];
    }
    return null;
  },
};


export default i18nHelpers;
