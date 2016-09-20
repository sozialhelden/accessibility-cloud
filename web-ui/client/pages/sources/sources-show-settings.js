import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Sources } from '/both/api/sources/sources.js';

Template.sources_show_settings_page.onCreated(function created() {
  window.Sources = Sources;

  this.autorun(() => {
    this.subscribe('sources.public');
  });
});

Template.sources_show_settings_page.helpers({
  source() {
    return Sources.findOne({ _id: FlowRouter.getParam('_id') });
  },
});
