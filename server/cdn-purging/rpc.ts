import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { isAdmin } from '../../both/lib/is-admin';
import sendPurgeRequestToFastly from './sendPurgeRequestToFastly';

Meteor.methods({
  // tslint:disable-next-line:function-name
  'fastly.purge'(this: { userId: string, unblock: (() => void) }, keys: string[]) {
    check(keys, [String]);

    if (!this.userId) {
      throw new Meteor.Error(401, 'Please log in first.');
    }

    if (!isAdmin(this.userId)) {
      throw new Meteor.Error(403, 'Not authorized');
    }

    this.unblock();

    check(keys, [String]);

    return sendPurgeRequestToFastly(keys);
  },
});
