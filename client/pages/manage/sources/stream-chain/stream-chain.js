import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import { moment } from 'meteor/momentjs:moment';

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
    return `${this.speed} k${this.unitName}/s`;
  },
  isInspectString(key) {
    return !!key.match(/InspectString$/);
  },
  additionalTemplate() {
    return `sources_stream_chain_${this.type}`;
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
