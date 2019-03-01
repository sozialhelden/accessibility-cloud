import { Meteor } from 'meteor/meteor';
import { GlobalAttributeStats } from '../global-attribute-stats';

Meteor.startup(() => {
  GlobalAttributeStats._ensureIndex({ date: -1 });
});
