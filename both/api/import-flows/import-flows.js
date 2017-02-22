import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const ImportFlows = new Mongo.Collection('ImportFlows');

ImportFlows.schema = new SimpleSchema({
  sourceId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  name: {
    label: 'Name',
    type: String,
  },
  createdAt: {
    type: Number,
  },
  streams: {
    type: Array,
    label: 'Stream chain setup',
    optional: true,
  },
  'streams.$': {
    type: Object,
    blackbox: true,
  },
  'streams.$.type': {
    type: String,
  },
});

ImportFlows.attachSchema(ImportFlows.schema);

ImportFlows.helpers({
  inputMimeType() {
    const downloadItem = this.streams.find(
      ({ type }) => type === 'HTTPDownload'
    );

    return downloadItem
            && downloadItem.parameters
            && downloadItem.parameters.inputMimeType;
  },
  hasStreams() {
    return this.streams && this.streams.length > 0;
  },
  getStreams() {
    return this.streams;
  },
  getFirstStream() {
    return this.streams[0];
  },
  hasDownloadStep() {
    if (!this.streams) {
      return false;
    }

    return this.streams.some(
      step => step.type === 'HTTPDownload' && !!step.parameters.sourceUrl
    );
  },
});

if (Meteor.isServer) {
  ImportFlows._ensureIndex({ sourceId: 1 });
}
