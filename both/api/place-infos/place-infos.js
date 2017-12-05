import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { _ } from 'meteor/stevezhu:lodash';
import {
  pathsInObject,
  getTranslationForAccessibilityAttributeName,
} from '/both/i18n/ac-format-translations';
import { Categories } from '/both/api/categories/categories';
import { EquipmentInfos } from '../equipment-infos/equipment-infos';
import { Sources } from '../sources/sources';
import { Disruptions } from '../disruptions/disruptions';
import convertToGeoJSONFeature from '../shared/convertToGeoJSONFeature';


export const PlaceInfos = new Mongo.Collection('PlaceInfos');


export const helpers = {
  getLocalizedCategory(locale) {
    if (!this.properties) return '';
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

// Convert a given plain MongoDB document (not transformed) into a GeoJSON feature
PlaceInfos.wrapDocumentAPIResponse = ({ result, req }) => {
  const locale = req.query.locale;
  Object.assign(result.properties, {
    localizedCategory: helpers.getLocalizedCategory.call(result, locale),
    accessibility: helpers.getLocalizedAccessibility.call(result, locale),
  });
  return result;
};

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
  belongsTo: {
    source: {
      foreignCollection: Sources,
      foreignKey: 'properties.sourceId',
    },
  },
  hasMany: {
    equipmentInfos: {
      foreignCollection: EquipmentInfos,
      foreignKey: 'properties.placeInfoId',
    },
    disruptions: {
      foreignCollection: Disruptions,
      foreignKey: 'properties.placeInfoId',
    },
  },
};

if (Meteor.isClient) {
  window.PlaceInfos = PlaceInfos;
}
