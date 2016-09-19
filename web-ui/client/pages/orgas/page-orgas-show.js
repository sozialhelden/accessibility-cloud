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
    debugger
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
    //return [{name:"bla"}, {name:"bladf"}];
    const orgCursor= Organizations.find({});
    console.log(orgCursor);
    return orgCursor;
  },
});
