import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const PlaceInfos = new Mongo.Collection('PlaceInfos');

if (Meteor.isClient) {
  window.PlaceInfos = PlaceInfos;
}
