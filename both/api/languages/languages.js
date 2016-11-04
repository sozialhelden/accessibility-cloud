import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Languages = new Mongo.Collection('Languages');

Languages.schema = new SimpleSchema({
  name: { type: String },
  languageCode: { type: String },
});

Languages.attachSchema(Languages.schema);
