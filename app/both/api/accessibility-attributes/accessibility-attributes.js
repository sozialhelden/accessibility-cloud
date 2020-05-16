import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import LocalizedStringSchema from '../shared/LocalizedStringSchema';

export const AccessibilityAttributes = new Mongo.Collection('AccessibilityAttributes');

AccessibilityAttributes.schema = new SimpleSchema({
  label: LocalizedStringSchema,
});

AccessibilityAttributes.attachSchema(AccessibilityAttributes.schema);

if (Meteor.isClient) {
  window.AccessibilityAttributes = AccessibilityAttributes;
}
