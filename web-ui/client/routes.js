import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// Import to load these templates
// import '../../ui/layouts/app-body.js';
// import '../../ui/pages/root-redirector.js';
// import '../../ui/pages/organizations-show-page.js';
// import '../../ui/pages/organizations-list-page.js';
// import '../../ui/pages/app-not-found.js';

// Import to override accounts templates
// import '../../ui/accounts/accounts-templates.js';


FlowRouter.route('/', {
  action() {
    BlazeLayout.render('app_layout_with_header', { main: 'home2', header_navigation_list: 'home_header_navigation' });
  },
});

FlowRouter.route('/post/:slug', {
  action() {
    BlazeLayout.render('app_layout_with_header', { main: 'post' });
  },
});

FlowRouter.route('/organizations/:_id', {
  name: 'Organizations.show',
  action() {
    BlazeLayout.render('App_body', { main: 'Organizations_show_page' });
  },
});

FlowRouter.route('/organizations', {
  //name: 'Organizations.show',
  name: 'organizations.list',
  action() {    
    BlazeLayout.render('App_body', { main: 'Organizations_list_page' });
  },
});

FlowRouter.route('/lists/:_id', {
  name: 'Lists.show',
  action() {
    BlazeLayout.render('App_body', { main: 'Lists_show_page' });
  },
});

// FlowRouter.route('/', {
//   name: 'App.home',
//   action() {
//     BlazeLayout.render('App_body', { main: 'app_rootRedirector' });
//   },
// });

// the App_notFound template is used for unknown routes and missing lists
FlowRouter.notFound = {
  action() {
    BlazeLayout.render('App_body', { main: 'App_notFound' });
  },
};
