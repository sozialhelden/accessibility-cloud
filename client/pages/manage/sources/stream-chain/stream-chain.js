import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import { moment } from 'meteor/momentjs:moment';

function format(n) {
  const number = Number(n);
  if (number.toLocaleString) {
    return number.toLocaleString('en-US');
  }
  return number.toString();
}

Template.sources_stream_chain.helpers({
  unitName() {
    return this.unitName || 'bytes';
  },
  humanizedEta() {
    return moment.duration(this.eta || 0).humanize();
  },
  humanizedRuntime() {
    return moment.duration(this.runtime || 0).humanize();
  },
  stringify(object) {
    const json = JSON.stringify(object, true, 4);
    return json && json
      .replace(/(^")/, '')
      .replace(/("$)/, '');
  },
  hasParameters() {
    return !_.isEmpty(this.parameters);
  },
  speedString() {
    if (this.speed > 1) {
      return `${Math.round(this.speed)} k${this.unitName}/s`;
    }
    return `${Math.round(1000 * this.speed)} ${this.unitName}/s`;
  },
  isInspectString(key) {
    return !!key.match(/InspectString$/);
  },
  additionalTemplate() {
    return `sources_stream_chain_${this.type}`;
  },
  progressString() {
    const [transferred, length] = this.length ?
      [this.transferred, this.length] :
      [this.transferredCompressed || this.transferred, this.lengthCompressed];

    if (length) {
      return `${format(transferred)} of ${format(length)} ${this.unitName}`;
    }
    return `${format(transferred)} ${this.unitName}`;
  },
});

Template.sources_stream_chain.events({
  'click .btn.js-abort-import'(event) {
    event.preventDefault();
    Meteor.call('sources.abortImport', this.sourceId, (err) => {
      if (err) {
        console.log(err);
        alert(err);
      }
    });
  },
});
