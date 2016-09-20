import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Sources } from '../sources.js';

export const remove = new ValidatedMethod({
  name: 'sources.remove',
  validate: new SimpleSchema({}).validator(),
  run({ sourceId }) {
    const source = Sources.findOne(sourceId);

    if (!source.editableBy(this.userId)) {
      throw new Meteor.Error('sources.remove.accessDenied',
        'You don\'t have permission to remove this source.');
    }

    Sources.remove(sourceId);
  },
});
