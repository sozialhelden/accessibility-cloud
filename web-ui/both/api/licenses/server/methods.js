import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Licenses } from '../licenses.js';

// export const insert = new ValidatedMethod({
//   name: 'licenses.insert',
//   validate: new SimpleSchema({}).validator(),
//   run() {
//     return Licenses.insert({});
//   },
// });

// export const remove = new ValidatedMethod({
//   name: 'licenses.remove',
//   validate: new SimpleSchema({}).validator(), 
//   run({ organizationId }) {
//     const organization = Licenses.findOne(organizationId);

//     if (!organization.editableBy(this.userId)) {
//       throw new Meteor.Error('licenses.remove.accessDenied',
//         'You don\'t have permission to remove this organization.');
//     }

//     Licenses.remove(organizationId);
//   },
// });
