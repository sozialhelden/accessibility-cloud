import { Meteor } from 'meteor/meteor';
import { AccessibilityAttributes } from '../accessibility-attributes';

Meteor.startup(() => {
  AccessibilityAttributes._ensureIndex({ label: 1 });
});
