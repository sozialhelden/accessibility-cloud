import { Meteor } from 'meteor/meteor';
import { SourceImports } from '../source-imports.js';

const options = { fields: SourceImports.publicFields, sort: { startTimestamp: -1 } };
Meteor.publish('sourceImports.public', () => SourceImports.find({}, options));
