import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Organizations } from '/both/api/organizations/organizations.js';

import subsManager from '/client/lib/subs-manager';

Template.organizations_show_header_sub.onCreated(() => {
  subsManager.subscribe('organizations.public');
});


Template.organizations_show_header_sub.helpers({
  activeIfRouteNameIs(routeName) {
    return routeName === FlowRouter._current.route.name ? 'active' : '';
  },
  organization() {
    return Organizations.findOne({ _id: FlowRouter.getParam('_id') });
  },
});
