import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';

import { Organizations } from '../organizations.js';

// const ORGANIZATION_ID_ONLY = new SimpleSchema({
//   organizationId: Organizations.simpleSchema().schema('_id'),
// }).validator({ clean: true, filter: false });

export const insert = new ValidatedMethod({
  name: 'organizations.insert',
  validate: new SimpleSchema({}).validator(),
  run() {
    // console.log("organizations.insert()");
    return Organizations.insert({});
  },
});

Meteor.methods({
  'organizationsInsert': function(doc) {
    // console.log(">>> DEBUG organizationsInsert()");
    this.unblock();
  },
});

export const updateName = new ValidatedMethod({
  name: 'organizations.updateName',
  validate: new SimpleSchema({
    // organizationId: Organizations.simpleSchema().schema('_id'),
    newName: Organizations.simpleSchema().schema('name'),
  }).validator({ clean: true, filter: false }),
  run({ organizationId, newName }) {
    const organization = Organizations.findOne(organizationId);

    if (!organization.editableBy(this.userId)) {
      throw new Meteor.Error('organizations.updateName.accessDenied',
        'You don\'t have permission to edit this organization.');
    }

    Organizations.update(organizationId, {
      $set: { name: newName },
    });
  },
});

export const remove = new ValidatedMethod({
  name: 'organizations.remove',
  validate: new SimpleSchema({}).validator(), // ORGANIZATION_ID_ONLY,
  run({ organizationId }) {
    const organization = Organizations.findOne(organizationId);

    if (!organization.editableBy(this.userId)) {
      throw new Meteor.Error('organizations.remove.accessDenied',
        'You don\'t have permission to remove this organization.');
    }

    Organizations.remove(organizationId);
  },
});

// Get organization of all method names on Organizations
const ORGANIZATIONS_METHODS = _.pluck([
  insert,
  updateName,
  remove,
], 'name');

if (Meteor.isServer) {
  // Only allow 5 organization operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(ORGANIZATIONS_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; },
  }, 5, 1000);
}
