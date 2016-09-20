import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Organizations } from '/both/api/organizations/organizations.js';

Template.organizations_show_page.onCreated(function created() {
  this.autorun(() => {
    this.subscribe('organizations.public');
  });
});

Template.organizations_show_page_header_navigation.helpers({
  orga() {
    const orga = Organizations.findOne({ _id: FlowRouter.getParam('_id') });
    return orga;
  },
});

Template.organizations_show_page.helpers({
  orga() {
    const orga = Organizations.findOne({ _id: FlowRouter.getParam('_id') });
    return orga;
  },
  organizations() {
    const orgCursor = Organizations.find({});
    return orgCursor;
  },
});
