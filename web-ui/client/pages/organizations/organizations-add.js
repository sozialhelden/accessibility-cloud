import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Organizations } from '/both/api/organizations/organizations.js';

Template.page_orgas_add.onCreated(function() {
  const self = this;

  window.Organizations = Organizations;

  self.autorun(function() {
    self.subscribe('organizations.public');
  });
});

// Template.page_orgas_add_header_navigation.helpers({
//   orga() {
//     const orga = Organizations.findOne({ _id: FlowRouter.getParam('_id') });
//     return orga;
//   },
// });

Template.page_orgas_add.helpers({
  // orga() {
  //   const orga = Organizations.findOne({ _id: FlowRouter.getParam('_id') });
  //   return orga;
  // },
  // organizations() {
  //   const orgCursor= Organizations.find({});
  //   console.log(orgCursor);
  //   return orgCursor;
  // },
  Organisations() {
    return Organizations;
  },
  organizationsFormSchema() {
    return Organizations.schema;
  },
});
