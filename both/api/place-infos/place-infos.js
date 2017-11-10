import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { _ } from 'meteor/stevezhu:lodash';
import {
  pathsInObject,
  getTranslationForAccessibilityAttributeName,
} from '/server/i18n/ac-format-translations';
import { Categories } from '/both/api/categories/categories';
import { EquipmentInfos } from '../equipment-infos/equipment-infos';
import { Disruptions } from '../disruptions/disruptions';
import convertToGeoJSONFeature from '../shared/convertToGeoJSONFeature';


export const PlaceInfos = new Mongo.Collection('PlaceInfos');


const helpers = {
  getLocalizedCategory(locale) {
    const category = Categories.findOne(this.properties.category);
    if (!category) {
      console.log(`Category ${this.properties.category} not found.`);
      return '';
    }
    return category.getLocalizedId(locale);
  },
  getLocalizedAccessibility(locale) {
    const result = _.cloneDeep(this.properties.accessibility);
    const paths = pathsInObject(result);
    paths.forEach((path) => {
      _.set(result, `${path}Localized`, getTranslationForAccessibilityAttributeName(path, locale));
    });
    return result;
  },
  getLocalizedName(locale) {
    if (locale && !(typeof locale === 'string')) throw new Meteor.Error(422, 'Locale must be undefined or a string.');
    if (!this.properties) return null;
    if (typeof this.properties.name === 'string') return this.properties.name;
    if (typeof this.properties.name === 'object') {
      if (!locale) {
        if (typeof this.properties.name.en_US === 'string') {
          return this.properties.name.en_US;
        }
        if (typeof this.properties.name.en === 'string') {
          return this.properties.name.en;
        }
        const firstAvailableLocale = Object.keys(this.properties.name)[0];
        if (firstAvailableLocale && typeof this.properties.name[firstAvailableLocale] === 'string') {
          return this.properties.name[firstAvailableLocale];
        }
      }
      if (typeof this.properties.name[locale] === 'string') {
        return this.properties.name[locale];
      }
      const localeWithoutCountry = locale.slice(0, 2);
      if (typeof this.properties.name[localeWithoutCountry] === 'string') {
        return this.properties.name[localeWithoutCountry];
      }
      if (typeof this.properties.name.en_US === 'string') {
        return this.properties.name.en_US;
      }
      if (typeof this.properties.name.en === 'string') {
        return this.properties.name.en;
      }
    }
    return null;
  },
};

// Convert a given plain MongoDB document (not transformed) into a GeoJSON feature
PlaceInfos.convertToGeoJSONFeature = (doc, coordinatesForDistance, locale) => {
  const convertedDocument = convertToGeoJSONFeature(doc, coordinatesForDistance, locale);
  if (locale) {
    Object.assign(convertedDocument.properties, {
      localizedCategory: helpers.getLocalizedCategory.call(doc, locale),
      accessibility: helpers.getLocalizedAccessibility.call(doc, locale),
    });
  }
  convertedDocument.properties.name = helpers.getLocalizedName.call(doc, locale);
  return convertedDocument;
};


PlaceInfos.helpers(helpers);

PlaceInfos.relationships = {
  hasMany: {
    equipmentInfos: {
      foreignCollection: EquipmentInfos,
      foreignKey: 'placeInfoId',
    },
    disruptions: {
      foreignCollection: Disruptions,
      foreignKey: 'placeInfoId',
    },
  },
};

if (Meteor.isClient) {
  window.PlaceInfos = PlaceInfos;
}
