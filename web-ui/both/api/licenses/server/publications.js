import { Meteor } from 'meteor/meteor';
import { Licenses } from '../licenses.js';

Meteor.publish('licenses.public', () => Licenses.find({}, { fields: Licenses.publicFields }));
