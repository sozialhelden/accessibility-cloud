import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import i18nHelpers from '../shared/i18nHelpers';
import { EquipmentInfos } from '../equipment-infos/equipment-infos';
import { Sources } from '../sources/sources';
import { Disruptions } from '../disruptions/disruptions';
import convertToGeoJSONFeature from '../shared/convertToGeoJSONFeature';
import { Images } from '../images/images';


export const PlaceInfos = new Mongo.Collection('PlaceInfos');


PlaceInfos.convertToJSON = (doc, coordinatesForDistance, locale) => {
  const convertedDocument = convertToGeoJSONFeature(doc, coordinatesForDistance, locale);
  return convertedDocument;
};


PlaceInfos.helpers(i18nHelpers);


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
    images: {
      foreignCollection: Images,
      foreignKey: 'objectId',
    },
  },
};

if (Meteor.isClient) {
  window.PlaceInfos = PlaceInfos;
}
