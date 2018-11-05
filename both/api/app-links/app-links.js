import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Organizations } from '/both/api/organizations/organizations';
import { Apps } from '/both/api/apps/apps';
import LocalizedStringSchema from '../shared/LocalizedStringSchema';

export const AppLinks = new Mongo.Collection('AppLinks');


AppLinks.schema = new SimpleSchema({
  appId: { type: SimpleSchema.RegEx.Id },
  label: LocalizedStringSchema,
  url: LocalizedStringSchema,
  order: { type: Number },
});

AppLinks.attachSchema(AppLinks.schema);

AppLinks.helpers({
  getOrganization() {
    return Organizations.findOne(this.organizationId);
  },
});

AppLinks.apiParameterizedSelector = selector => selector;

AppLinks.relationships = {
  belongsTo: {
    app: {
      foreignCollection: Apps,
      foreignKey: 'appId',
    },
  },
};


if (Meteor.isClient) {
  window.AppLinks = AppLinks;
}
