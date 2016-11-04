import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Sources } from '/both/api/sources/sources.js';

import subsManager from '/client/lib/subs-manager';

Template.sources_show_header_sub.onCreated(() => {
  
});


Template.sources_show_header_sub.helpers({
  activeIfRouteNameIs(routeName) {
    return routeName === FlowRouter._current.route.name ? 'active' : '';
  },
  source() {
    return Sources.findOne({ _id: FlowRouter.getParam('_id') });
  },
});
