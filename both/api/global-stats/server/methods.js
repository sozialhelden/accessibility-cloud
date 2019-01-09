import { Meteor } from 'meteor/meteor';
import { calculateGlobalStatsNow } from './calculation';
import { isAdmin } from '../../../lib/is-admin';

Meteor.methods({
  'GlobalStats.calculateNow'() {
    if (!this.userId) {
      throw new Meteor.Error(401, 'Please log in first.');
    }
    if (!isAdmin(this.userId)) {
      throw new Meteor.Error(403, 'You are not authorized to calculate global stats.');
    }
    return calculateGlobalStatsNow();
  },
});
