import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Organizations } from '/both/api/organizations/organizations.js';

Template.page_orgas_show.onCreated(function() {
  const self = this;

  self.autorun(function() {
    self.subscribe('organizations.public');
  });
});

Template.page_orgas_show_header_navigation.helpers({
  orga() {
    const orga = Organizations.findOne({ _id: FlowRouter.getParam('_id') });
    return orga;
  },
});

Template.page_orgas_show.helpers({
  orga() {
    const orga = Organizations.findOne({ _id: FlowRouter.getParam('_id') });
    return orga;
  },
  organizations() {
    const orgCursor= Organizations.find({});
    return orgCursor;
  },
});
