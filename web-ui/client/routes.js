import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

/*
Planned routes are...

/welcome
/browse/:_id/
/browse/:_id/:_sourceId/

/browse/sources/
/browse/sources/:_id/edit
/browse/organizations/:_id/
/browse/organizations/:_id/sources ???

/ <- dashboard

/manage/organizations/create
/manage/organizations/:_id    <- includes link to delete
/manage/organizations/:_id/edit
/manage/organizations/:_id/sources/create
/manage/organizations/:_id/apps/create
/manage/organizations/:_id/licences/create

/manage/sources/:_id
/manage/sources/:_id/imports
/manage/sources/:_id/format
/manage/sources/:_id/settings
/manage/sources/:_id/imports/:importId
/manage/sources/:_id/access

/manage/licenses/
/manage/licenses/:_id
/manage/licenses/:_id/edit

/manage/apps/               <-- DO WE REALLY NEED THIS?
/manage/apps/:_id
/manage/apps/:_id/edit


/help
/signup
/signin
/forgot-password
/reset-password
/terms-of-service/organizations
/terms-of-service/people
/press
/imprint
*/

function checkLoggedIn (ctx, redirect) {
  if (!Meteor.userId()) {
    redirect('/');
  }
}

function redirectIfLoggedIn (ctx, redirect) {
  if (Meteor.userId()) {
    redirect('/dashboard');
  }
}


FlowRouter.route('/', {
  name: 'manage.dashboard',
  action() {
    if (Meteor.userId()) {
      BlazeLayout.render('app_layout_scrollable', {
        main: 'page_dashboard',
        header_navigation_list: 'dashboard_header_navigation' });
    } else {
      BlazeLayout.render('app_layout_start_page', {
        main: 'page_start',
      });
    }
  },
});

// ---- Organizations ------------------------------
// FlowRouter.route('/organizations', {
//   name: 'organizations.list',
//   action() {
//     BlazeLayout.render('app_layout_scrollable', {
//       main: 'page_orgas_list',
//       header_navigation_list: 'home_header_navigation' });
//   },
// });

// FlowRouter.route('/organizations/:_id', {
//   name: 'organizations.show',
//   action() {
//     BlazeLayout.render('app_layout_scrollable', {
//       main: 'organizations_show_page',
//       header_navigation_list: 'organizations_show_page_header_navigation' });
//   },
// });

// ========= BROWSE =======================================================

const browseRoutes = FlowRouter.group({
  name: 'browse',
  prefix: '/browse',
  triggersEnter: [
    checkLoggedIn,
  ],
});

browseRoutes.route('/dashboard', {
  name: 'browse.dashboard',

  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'browse_dashboard_page',
      header_navigation_list: 'home_header_navigation' });
  },
});

browseRoutes.route('/sources/:_id', {
  name: 'browse.sources.show',

  action() {
    BlazeLayout.render('app_layout_mapview', {
      main: 'sources_show_page',
      header_navigation_list: 'sources_show_header',
      //header_sub: 'sources_show_header_sub',
    });
  },
});


// ========= MANAGE =======================================================


const manageRoutes = FlowRouter.group({
  name: 'manage',
  prefix: '/manage',
  triggersEnter: [
    checkLoggedIn,
  ],
});

// --- organizations ------------------

manageRoutes.route('/organizations', {
  name: 'manage.organizations.list',

  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'organizations_list_page',
      header_navigation_list: 'home_header_navigation' });
  },
});

manageRoutes.route('/organizations/create', {
  name: 'manage.organizations.create',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'organizations_create_page',
      // header_navigation_list: 'home_header_navigation',
    });
  },
});

manageRoutes.route('/organizations/:_id', {
  name: 'manage.organizations.show',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'organizations_show_page',
      header_navigation_list: 'organizations_show_header',
      header_sub: 'organizations_show_header_sub',
    });
  },
});

manageRoutes.route('/organizations/:_id/settings', {
  name: 'manage.organizations.show.settings',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'organizations_show_settings_page',
      header_navigation_list: 'organizations_show_header',
      header_sub: 'organizations_show_header_sub',
    });
  },
});

// ---- licenses ----------------------------------------------

manageRoutes.route('/organizations/:_id/licenses', {
  name: 'manage.organizations.show.licenses',

  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'licenses_list_page',
      header_navigation_list: 'organizations_show_header',
      header_sub: 'organizations_show_header_sub',
    });
  },
});

manageRoutes.route('/organizations/:_id/licenses/create', {
  name: 'manage.organizations.licenses.create',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'licenses_create_page',
      header_navigation_list: 'organizations_show_header',
      header_sub: 'organizations_show_header_sub',
    });
  },
});

manageRoutes.route('/licenses/:_id', {
  name: 'manage.licenses.show',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'licenses_show_page',
      header_navigation_list: 'organizations_show_header',
      header_sub: 'organizations_show_header_sub',
    });
  },
});

manageRoutes.route('/licenses/:_id/edit', {
  name: 'manage.licenses.edit',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'licenses_edit_page',
      header_navigation_list: 'organizations_show_header',
      header_sub: 'organizations_show_header_sub',
    });
  },
});

// ---- APPS -------------------------------------------------

manageRoutes.route('/organizations/:_id/apps', {
  name: 'manage.organizations.show.apps',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'apps_list_page',
      header_navigation_list: 'organizations_show_header',
      header_sub: 'organizations_show_header_sub',
    });
  },
});

manageRoutes.route('/organizations/:_id/apps/create', {
  name: 'manage.organizations.apps.create',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'apps_create_page',
      header_navigation_list: 'organizations_show_header',
      header_sub: 'organizations_show_header_sub',
    });
  },
});

manageRoutes.route('/apps/:_id', {
  name: 'manage.apps.show',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'apps_show_page',
      header_navigation_list: 'organizations_show_header',
      header_sub: 'organizations_show_header_sub',
    });
  },
});

manageRoutes.route('/apps/:_id/edit', {
  name: 'manage.apps.edit',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'apps_edit_page',
      header_navigation_list: 'organizations_show_header',
      header_sub: 'organizations_show_header_sub',
    });
  },
});


// ---- sources ----------------------------------------------

manageRoutes.route('/organizations/:_id/sources/create', {
  name: 'manage.organizations.sources.create',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'sources_create_page',
      header_navigation_list: 'sources_create_header',
    });
  },
});

manageRoutes.route('/sources/:_id', {
  name: 'manage.sources.show',
  action() {
    BlazeLayout.render('app_layout_mapview', {
      main: 'sources_show_page',
      header_navigation_list: 'sources_show_header',
      header_sub: 'sources_show_header_sub',
    });
  },
});

manageRoutes.route('/sources/:_id/format', {
  name: 'manage.sources.show.format',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'sources_show_format_page',
      header_navigation_list: 'sources_show_header',
      header_sub: 'sources_show_header_sub',
    });
  },
});

manageRoutes.route('/sources/:_id/settings', {
  name: 'manage.sources.show.settings',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'sources_show_settings_page',
      header_navigation_list: 'sources_show_header',
      header_sub: 'sources_show_header_sub',
    });
  },
});


manageRoutes.route('/sources/:_id/access', {
  name: 'manage.sources.show.access',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'sources_show_access_page',
      header_navigation_list: 'sources_show_header',
      header_sub: 'sources_show_header_sub',
    });
  },
});


manageRoutes.route('/sources/:_id/imports', {
  name: 'manage.sources.show.imports',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'sources_show_imports_page',
      header_navigation_list: 'sources_show_header',
      header_sub: 'sources_show_header_sub',
    });
  },
});


manageRoutes.route('/sources/:_id/imports/:importId?', {
  name: 'manage.sources.show.import',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'sources_show_imports_page',
      header_navigation_list: 'sources_show_header',
      header_sub: 'sources_show_header_sub',
    });
  },
});

// === NOT FOUND ===================================

// the App_notFound template is used for unknown routes and missing lists
FlowRouter.notFound = {
  action() {
    BlazeLayout.render('App_body', { main: 'App_notFound' });
  },
};
