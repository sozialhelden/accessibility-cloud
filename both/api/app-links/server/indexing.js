import { Meteor } from 'meteor/meteor';
import { AppLinks } from '../app-links';

Meteor.startup(() => {
  AppLinks._ensureIndex({ appId: 1 });
});
