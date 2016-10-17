import { Mongo } from 'meteor/mongo';
import { isAdmin } from '/both/lib/is-admin';
import { moment } from 'meteor/momentjs:moment';

export const SourceImports = new Mongo.Collection('SourceImports');

SourceImports.allow({
  insert: isAdmin,
  update: isAdmin,
  remove: isAdmin,
});

SourceImports.publicFields = {
  sourceId: 1,
  streamChain: 1,
  startTimestamp: 1,
  numberOfPlacesAdded: 1,
  numberOfPlacesModified: 1,
  numberOfPlacesRemoved: 1,
  numberOfPlacesUnchanged: 1,
};

SourceImports.helpers({
  editableBy: isAdmin,
  humanReadableStartTimestamp() {
    return moment(this.startTimestamp).format('DD.MM.YYYY HH:mm:ss');
  },
});
