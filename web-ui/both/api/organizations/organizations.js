import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/factory';
import { Sources } from '/both/api/sources/sources';

export const Organizations = new Mongo.Collection('Organizations');

// Deny all client-side updates since we will be using methods to manage this collection
// Organizations.deny({
//   insert() { return true; },
//   update() { return true; },
//   remove() { return true; },
// });


// FIXME: WARNING, these need to be fixed
Organizations.allow({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});


Organizations.schema = new SimpleSchema({
  // _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  name: { type: String },
  //userId: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },
});

Organizations.attachSchema(Organizations.schema);

// This represents the keys from Organizations objects that should be published
// to the client. If we add secret properties to Organization objects, don't organization
// them here to keep them private to the server.
Organizations.publicFields = {
  name: 1,
};

Factory.define('organization', Organizations, {
  name: 'ACME GmbH',
});

Organizations.helpers({
  editableBy(userId) {
    return true || userId;  // FIXME: allow editing only for members and admins of organization
  },
  getSources() {
    return Sources.find({ organizationId: this._id });
  },
});
