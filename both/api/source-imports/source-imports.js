import { Mongo } from 'meteor/mongo';
import { moment } from 'meteor/momentjs:moment';
import { _ } from 'meteor/underscore';

export const SourceImports = new Mongo.Collection('SourceImports');

SourceImports.helpers({
  humanReadableStartTimestamp() {
    return moment(this.startTimestamp).format('DD.MM.YYYY HH:mm:ss');
  },
  hasError() {
    if (!this.streamChain) return false;
    return _.any(this.streamChain, streamElement => streamElement.error);
  },
  isFinished() {
    if (!this.streamChain) return false;
    const lastStream = _.last(this.streamChain);
    return lastStream && lastStream.progress && lastStream.progress.isFinished;
  },
});
