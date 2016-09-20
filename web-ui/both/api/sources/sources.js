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
  name: { type: String },
  organizationId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoform: {
      type: 'hidden',
    },
  },
});

Sources.attachSchema(Sources.schema);

Sources.publicFields = {
  name: 1,
};

Factory.define('source', Sources, {});


Sources.helpers({
  // Used by methods-validation
  editableBy(userId) {
    return false; // test to valid denial
    //return true || userId;  // FIXME: allow editing only for members and admins of source
  },
  getOrganization() {
    return Organizations.findOne(this.organizationId);
  },
});
