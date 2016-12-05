import { Mongo } from 'meteor/mongo';
import { moment } from 'meteor/momentjs:moment';
import { _ } from 'meteor/underscore';

export const SourceImports = new Mongo.Collection('SourceImports');

SourceImports.helpers({
  humanReadableStartTimestamp() {
    return moment(this.startTimestamp).format('DD.MM.YYYY HH:mm:ss');
  },
  agoStartTimestamp() {
    return moment(this.startTimestamp).fromNow();
  },
  hasError() {
    if (!this.streamChain) return false;
    return _.any(this.streamChain, streamElement => streamElement.error);
  },
  isFinished() {
    if (!this.streamChain) return false;
    return _.all(this.streamChain, stream =>
      stream && stream.progress && stream.progress.isFinished);
  },
  isRunning() {
    if (!this.streamChain) return false;
    return _.any(this.streamChain, stream =>
      !stream || !stream.progress || !(stream.progress.isFinished || stream.progress.isAborted));
  },
  isAborted() {
    if (!this.streamChain) return false;
    return _.any(this.streamChain, stream =>
      stream && stream.progress && stream.progress.isAborted
    );
  },
  setUnfinishedStreamsToAborted() {
    const modifier = { $set: { } };
    this.streamChain.forEach((stream, index) => {
      if (!stream.progress || !stream.progress.isFinished) {
        modifier.$set[`streamChain.${index}.progress.isAborted`] = true;
        modifier.$set[`streamChain.${index}.progress.isFinished`] = false;
      }
    });
    const count = Object.keys(modifier.$set).length;
    console.log('Setting', count, 'streams to aborted for source import', this._id, '...');
    if (count) {
      SourceImports.update(this._id, modifier);
    }
  },
  upsertStream() {
    return this.streamChain.find(stream => stream && stream.type === 'UpsertPlace');
  },
  importedPlaceCount() {
    const upsertStream = this.upsertStream();
    return upsertStream && upsertStream.progress && upsertStream.progress.transferred || 0;
  },
});
