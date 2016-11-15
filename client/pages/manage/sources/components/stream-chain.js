import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';

Template.sources_stream_chain.helpers({
  unitName() {
    return this.unitName || 'bytes';
  },
  etaInSeconds() {
    return 0.001 * (this.eta || 0);
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
    if (this.unitName) {
      return `${this.speed / 1000} ${this.unitName}/s`;
    }
    return `${this.speed / 1024} kb/s`;
  },
});
