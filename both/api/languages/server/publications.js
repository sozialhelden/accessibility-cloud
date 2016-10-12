import { Meteor } from 'meteor/meteor';
import { Languages } from '../languages.js';

Meteor.publish('languages.public', () => Languages.find({}, { fields: Languages.publicFields }));
