import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Organizations } from '/both/api/organizations/organizations.js';
import { Sources } from '/both/api/sources/sources.js';
import subsManager from '/client/lib/subs-manager';


Template.page_dashboard.onCreated(() => {
  subsManager.subscribe('organizations.withContent.mine');
});

const helpers = {
  organizations() {
    return Organizations.find({});
  },
  sources() {
    return Sources.find({});
  },
};

Template.page_dashboard.helpers(helpers);
Template.dashboard_header_navigation.helpers(helpers);
