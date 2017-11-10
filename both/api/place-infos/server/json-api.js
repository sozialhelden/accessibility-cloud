import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/stevezhu:lodash';
import { Sources } from '/both/api/sources/sources';
import {
  pathsInObject,
  getTranslationForAccessibilityAttributeName,
} from '/server/i18n/ac-format-translations';
import { Categories } from '/both/api/categories/categories';
import { PlaceInfos } from '/both/api/place-infos/place-infos';
import wrapAPIResponseAsGeoJSON from '../../shared/server/wrapAPIResponseAsGeoJSON';


PlaceInfos.wrapAPIResponse = wrapAPIResponseAsGeoJSON;

PlaceInfos.relationships = {
  belongsTo: {
    source: {
      foreignCollection: Sources,
      foreignKey: 'properties.sourceId',
    },
  },
};

PlaceInfos.includePathsByDefault = ['source.license'];
