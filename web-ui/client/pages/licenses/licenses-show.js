import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Licenses } from '/both/api/licenses/licenses.js';
import { Organizations } from '/both/api/organizations/organizations.js';

Template.licenses_show_page.onCreated(function created() {
  this.autorun(() => {
    this.subscribe('licenses.public');
    this.subscribe('organizations.public');
    this.subscribe('sources.public');
  });
});


Template.licenses_show_page.helpers({
  license() {
    const orga = Licenses.findOne({ _id: FlowRouter.getParam('_id') });
    return orga;
  },
  organizations() {
    const orgCursor = Licenses.find({});
    return orgCursor;
  },
});
