import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Licenses } from '/both/api/licenses/licenses.js';
import { Organizations } from '/both/api/organizations/organizations.js';
import subsManager from '/client/lib/subs-manager';

Template.licenses_show_page.onCreated(function created() {
  subsManager.subscribe('licenses.public');
  subsManager.subscribe('organizations.public');
  subsManager.subscribe('sources.public');
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
