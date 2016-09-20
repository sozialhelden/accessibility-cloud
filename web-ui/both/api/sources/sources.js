import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/factory';
import { Organizations } from '/both/api/organizations/organizations';

export const Sources = new Mongo.Collection('Sources');

// Deny all client-side updates since we will be using methods to manage this collection
// Sources.deny({
//   insert() { return true; },
//   update() { return true; },
//   remove() { return true; },
// });


// FIXME: WARNING, these need to be fixed
Sources.allow({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});


Sources.schema = new SimpleSchema({
  organizationId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  licenseId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  languageId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  name: { type: String },
  primaryRegion: { type: String },
  description: { type: String },
  originWebsite: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
  },
});

Sources.attachSchema(Sources.schema);

Sources.publicFields = {
  organizationId: 1,
  licenseId: 1,
  name: 1,
  primaryRegion: 1,
  description: 1,
  originWebsite: 1,
};

Factory.define('source', Sources, {
  organizationId: () => Factory.get('organization'),
  licenseId: () => Factory.get('license'),
  languageId: () => Factory.get('language'),
  name: 'Toilets in Vienna',
  primaryRegion: 'Vienna, Austria',
  description: 'All public toilets in vienna (JSON)',
  originWebsite: 'http://data.wien.gv.at',
  streamChain: [
    {
      type: 'httpDownload',
      parameters: {
        sourceUrl: 'http://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:WCANLAGEOGD&srsName=EPSG:4326&outputFormat=json',
      },
    },
    {
      type: 'convertCharacterSet',
      parameters: {
        from: 'iso-8895-1',
        to: 'utf-8',
      },
    },
    {
      type: 'parseJSON',
      parameters: {
        mappings: {
          _id: 'row.id',
          geometry: 'row.geometry',
          properties: 'row.properties',
          address: 'row.properties[\'STRASSE\'] + \', Bezirk \' + row.properties[\'BEZIRK\'] + \', Vienna, Austria\'',
          isAccessible: 'row.properties[\'KATEGORIE\'].includes(\'Behindertenkabine\')',
        },
      },
    },
  ],
});

Sources.helpers({
  // Used by methods-validation
  editableBy(userId) {
    // FIXME: allow editing only for members and admins of source
    return false; // test to valid denial
  },
  getOrganization() {
    return Organizations.findOne(this.organizationId);
  },
});
