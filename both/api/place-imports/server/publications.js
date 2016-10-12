import { Meteor } from 'meteor/meteor';
import { PlaceImports } from '../place-imports.js';

const options = { fields: PlaceImports.publicFields };
Meteor.publish('placeImports.public', () => PlaceImports.find({}, options));
