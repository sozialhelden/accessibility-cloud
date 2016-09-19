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


/*
Planned routes are...

/welcome
/help
/signup
/signin
/manage/addOrga
/manage/_orgaId
/manage/_orgaId/addOrga
/manage/_orgaId/_sourceId
/manage/_orgaId/_sourceId/imports/_importId
/manage/_orgaId/_sourceId/format
/manage/_orgaId/_sourceId/edit
/browse/_orgaId/
/browse/_orgaId/_sourceId/

*/

FlowRouter.route('/', {
  action() {
    BlazeLayout.render('app_layout_with_header', { main: 'page_home', header_navigation_list: 'home_header_navigation' });
  },
});

// ---- Organizations ------------------------------
FlowRouter.route('/orgas', {
  name: 'organizations.list',
  action() {    
    BlazeLayout.render('app_layout_with_header', { main: 'page_home', header_navigation_list: 'home_header_navigation' });
  },
});

FlowRouter.route('/orgas/:_id', {
  name: 'Organizations.show',
  action() {
    BlazeLayout.render('app_layout_with_header', { main: 'page_orgas_show', header_navigation_list: 'page_orgas_show_header_navigation' });
  },
});

// the App_notFound template is used for unknown routes and missing lists
FlowRouter.notFound = {
  action() {
    BlazeLayout.render('App_body', { main: 'App_notFound' });
  },
};
