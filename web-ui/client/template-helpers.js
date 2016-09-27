// import '/imports/startup/client';
// import '/imports/startup/both';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { _ } from 'meteor/underscore';
import { s } from 'meteor/underscorestring:underscore.string';

const helpers = {
  FlowRouter,
  humanize: s.humanize,
  camelize: s.camelize,
  stringify(object) {
    return JSON.stringify(object, true, 4);
  },
  _(str) {
    return str;
  },
  keyValue(object) {
    const result = [];
    _.each(object, (value, key) => result.push({ key, value }));
    return result;
  },
};

_.each(helpers, (fn, name) => Template.registerHelper(name, fn));
