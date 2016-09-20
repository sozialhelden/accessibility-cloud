import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';

import { Sources } from '../sources.js';

/*
export const insert = new ValidatedMethod({
  name: 'sources.insert',
  validate: new SimpleSchema({}).validator(),
  run() {
    // console.log("sources.insert()");
    return Sources.insert({});
  },
});
*/

/*
export const updateName = new ValidatedMethod({
  name: 'sources.updateName',
  validate: new SimpleSchema({
    // sourceId: Sources.simpleSchema().schema('_id'),
    newName: Sources.simpleSchema().schema('name'),
  }).validator({ clean: true, filter: false }),
  run({ sourceId, newName }) {
    const source = Sources.findOne(sourceId);

    if (!source.editableBy(this.userId)) {
      throw new Meteor.Error('sources.updateName.accessDenied',
        'You don\'t have permission to edit this source.');
    }

    Sources.update(sourceId, {
      $set: { name: newName },
    });
  },
});
*/

export const remove = new ValidatedMethod({
  name: 'sources.remove',
  validate: new SimpleSchema({}).validator(), // ORGANIZATION_ID_ONLY,
  run({ sourceId }) {
    const source = Sources.findOne(sourceId);

    if (!source.editableBy(this.userId)) {
      throw new Meteor.Error('sources.remove.accessDenied',
        'You don\'t have permission to remove this source.');
    }

    Sources.remove(sourceId);
  },
});
