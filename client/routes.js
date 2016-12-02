/* eslint-disable meteor/no-session */
/* Normally it's not okay to use Session, but router is handling global state. */

import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { $ } from 'meteor/jquery';


function acceptInvitationOnLogin() {
  Tracker.autorun((c) => {
    const invitationToken = Session.get('invitationToken');
    const organizationId = Session.get('organizationId');

    if (!invitationToken || !organizationId) {
      return;
    }

    if (!Meteor.userId()) {
      console.log('Waiting for user to sign in / sign up to accept invitation…');
      return;
    }

    console.log('Accepting invitation to collection…');

    Meteor.call(
      'organizationMembers.acceptInvitation',
      { organizationId, invitationToken },
      (error) => {
        if (error) {
          alert('Could not accept invitation:', error.reason); // eslint-disable-line no-alert
          FlowRouter.go('dashboard');
          return;
        }
        Session.set('invitationToken', null);
        Session.set('organizationId', null);
        FlowRouter.go('organizations.show', { _id: organizationId });
      }
    );

    c.stop();
  });
}


FlowRouter.triggers.enter([() => {
  $(window).scrollTop(0);
}]);

function checkLoggedIn(ctx, redirect) {
  if (!Meteor.userId()) {
    redirect('/');
  }
}


FlowRouter.route('/organizations/:_id/accept-invitation/:invitationToken', {
  name: 'organizations.acceptInvitation',
  action() {
    Session.set('invitationToken', this.getParam('invitationToken'));
    Session.set('organizationId', this.getParam('_id'));

    if (!Meteor.userId()) {
      FlowRouter.go('/join');
    }

    acceptInvitationOnLogin();
  },
});


// ========= ADMIN =======================================================

const adminRoutes = FlowRouter.group({
  name: 'admin',
  prefix: '/admin',
  triggersEnter: [
    checkLoggedIn,  // FIXME: should this be checkIsAdmin?
  ],
});

adminRoutes.route('/admin', {
  name: 'admin.admin_page',

  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'admin_page',
      header_navigation_list: 'admin_header_navigation' });
  },
});

adminRoutes.route('/categories/', {
  name: 'admin.categories.list',

  action() {
    BlazeLayout.render('app_layout_mapview', {
      main: 'categories_list_page',
      header_navigation_list: 'categories_list_head',
    });
  },
});


// ========= DATA =======================================================

const dataRoutes = FlowRouter.group({
  name: 'data',
  prefix: '',
});

dataRoutes.route('/', {
  name: 'dashboard',
  action() {
    if (Meteor.userId()) {
      BlazeLayout.render('app_layout_scrollable', {
        main: 'page_dashboard',
        header_navigation_list: 'dashboard_header_navigation',
      });
      acceptInvitationOnLogin();
    } else {
      BlazeLayout.render('app_layout_start_page', {
        main: 'page_start',
      });
    }
  },
});


dataRoutes.route('/organizations/create', {
  name: 'organizations.create',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'organizations_create_page',
      header_navigation_list: 'organizations_create_header',
    });
  },
});

dataRoutes.route('/organizations/:_id', {
  name: 'organizations.show',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'organizations_show_page',
      header_navigation_list: 'organizations_show_header',
      header_sub: 'organizations_show_header_sub',
    });
  },
});

dataRoutes.route('/organizations/:_id/settings', {
  name: 'organizations.show.settings',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'organizations_show_settings_page',
      header_navigation_list: 'organizations_show_header',
      header_sub: 'organizations_show_header_sub',
    });
  },
});

// ---- licenses ----------------------------------------------

dataRoutes.route('/organizations/:_id/licenses', {
  name: 'organizations.show.licenses',

  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'licenses_list_page',
      header_navigation_list: 'organizations_show_header',
      header_sub: 'organizations_show_header_sub',
    });
  },
});

dataRoutes.route('/organizations/:_id/members', {
  name: 'organizations.show.members',

  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'members_list_page',
      header_navigation_list: 'organizations_show_header',
      header_sub: 'organizations_show_header_sub',
    });
  },
});

dataRoutes.route('/organizations/:_id/licenses/create', {
  name: 'organizations.licenses.create',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'licenses_create_page',
      header_navigation_list: 'organizations_show_header',
      header_sub: 'organizations_show_header_sub',
    });
  },
});

dataRoutes.route('/licenses/:_id', {
  name: 'licenses.show',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'licenses_show_page',
      header_navigation_list: 'organizations_show_header',
      header_sub: 'organizations_show_header_sub',
    });
  },
});

dataRoutes.route('/licenses/:_id/edit', {
  name: 'licenses.edit',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'licenses_edit_page',
      header_navigation_list: 'organizations_show_header',
      header_sub: 'organizations_show_header_sub',
    });
  },
});

// ---- APPS -------------------------------------------------

dataRoutes.route('/organizations/:_id/apps', {
  name: 'organizations.show.apps',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'apps_list_page',
      header_navigation_list: 'organizations_show_header',
      header_sub: 'organizations_show_header_sub',
    });
  },
});

dataRoutes.route('/organizations/:_id/apps/create', {
  name: 'organizations.apps.create',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'apps_create_page',
      header_navigation_list: 'organizations_show_header',
      header_sub: 'organizations_show_header_sub',
    });
  },
});

dataRoutes.route('/apps/:_id', {
  name: 'app.show',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'apps_show_page',
      header_navigation_list: 'organizations_show_header',
      header_sub: 'organizations_show_header_sub',
    });
  },
});

dataRoutes.route('/apps/:_id/edit', {
  name: 'app.edit',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'apps_edit_page',
      header_navigation_list: 'organizations_show_header',
      header_sub: 'organizations_show_header_sub',
    });
  },
});


// ---- sources ----------------------------------------------

dataRoutes.route('/organizations/:_id/sources/create', {
  name: 'organizations.sources.create',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'sources_create_page',
      header_navigation_list: 'sources_create_header',
    });
  },
});

dataRoutes.route('/sources/:_id/format', {
  name: 'sources.show.format',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'sources_show_format_page',
      header_navigation_list: 'sources_show_header',
      header_sub: 'sources_show_header_sub',
    });
  },
});

dataRoutes.route('/sources/:_id/settings', {
  name: 'sources.show.settings',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'sources_show_settings_page',
      header_navigation_list: 'sources_show_header',
      header_sub: 'sources_show_header_sub',
    });
  },
});


dataRoutes.route('/sources/:_id/access', {
  name: 'sources.show.access',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'sources_show_access_page',
      header_navigation_list: 'sources_show_header',
      header_sub: 'sources_show_header_sub',
    });
  },
});


dataRoutes.route('/sources/:_id/imports', {
  name: 'sources.show.imports',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'sources_show_imports_page',
      header_navigation_list: 'sources_show_header',
      header_sub: 'sources_show_header_sub',
    });
  },
});


dataRoutes.route('/sources/:_id/imports/:importId?', {
  name: 'sources.show.import',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'sources_show_imports_page',
      header_navigation_list: 'sources_show_header',
      header_sub: 'sources_show_header_sub',
    });
  },
});

dataRoutes.route('/sources/:_id', {
  name: 'sources.show',
  action() {
    BlazeLayout.render('app_layout_mapview', {
      main: 'sources_show_page',
      header_navigation_list: 'sources_show_header',
      header_sub: 'sources_show_header_sub',
    });
  },
});

dataRoutes.route('/sources/:_id/place-infos/:placeInfoId', {
  name: 'placeInfos.show',
  action() {
    BlazeLayout.render('app_layout_mapview', {
      main: 'sources_show_page',
      header_navigation_list: 'sources_show_header',
      header_sub: 'sources_show_header_sub',
    });
  },
});


FlowRouter.route('/imprint', {
  name: 'imprint',
  action() {
    BlazeLayout.render('app_layout_scrollable', {
      main: 'imprint_page',
      header_navigation_list: 'imprint_header',
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
