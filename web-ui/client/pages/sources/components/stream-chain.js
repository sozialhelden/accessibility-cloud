import { Template } from 'meteor/templating';

Template.sources_stream_chain.helpers({
  stringify(object) {
    const json = JSON.stringify(object, true, 4);
    return json && json
      .replace(/(^")/, '')
      .replace(/("$)/, '');
  },
});
