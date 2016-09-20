import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/factory';
import { Sources } from '/both/api/sources/sources';

// class OrganizationsCollection extends Mongo.Collection {
//   insert(organization, callback) {
//     const ourOrganization = organization;
//     if (!ourOrganization.name) {
//       let nextLetter = 'A';
//       ourOrganization.name = `Organization ${nextLetter}`;

//       while (!!this.findOne({ name: ourOrganization.name })) {
//         // not going to be too smart here, can go past Z
//         nextLetter = String.fromCharCode(nextLetter.charCodeAt(0) + 1);
//         ourOrganization.name = `Organization ${nextLetter}`;
//       }
//     }

//     return super.insert(ourOrganization, callback);
//   }
//   remove(selector, callback) {
//     return super.remove(selector, callback);
//   }
// }

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

Factory.define('organization', Organizations, {});

Organizations.helpers({
  editableBy(userId) {
    return true || userId;  // FIXME: allow editing only for members and admins of organization
  },
  getSources() {
    return Sources.find({ organizationId: this._id });
  },
});
