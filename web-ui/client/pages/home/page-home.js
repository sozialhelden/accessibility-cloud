import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Organizations } from '/both/api/organizations/organizations.js';

Template.home2.onCreated(function() {
  const self = this;

  self.autorun(function() {
    self.subscribe('organizations.ofuser', FlowRouter.getParam('slug'));
  });
});

Template.home2.helpers({
  post() {
    return Organizations.findOne({ slug: FlowRouter.getParam('slug') });
  },
});
