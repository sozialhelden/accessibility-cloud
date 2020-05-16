import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

// eslint-disable-next-line import/prefer-default-export
export const GlobalAttributeStats = new Mongo.Collection('GlobalAttributeStats');

if (Meteor.isClient) {
  window.GlobalAttributeStats = GlobalAttributeStats;
}
