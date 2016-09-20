import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

Template.sources_show_header_sub.helpers({
  activeIfRouteNameIs(routeName) {
    return routeName === FlowRouter._current.route.name ? 'active' : '';
  },
});
