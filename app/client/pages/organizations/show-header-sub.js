import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Organizations } from '/both/api/organizations/organizations.js';
import { Licenses } from '/both/api/licenses/licenses.js';
import { Apps } from '/both/api/apps/apps.js';
import { SEO } from '/client/seo.js';

import subsManager from '/client/lib/subs-manager';

Template.organizations_show_header_sub.onCreated(() => {
  subsManager.subscribe('licenses.public');
  subsManager.subscribe('organizations.public');
  subsManager.subscribe('organizations.private');
});


Template.organizations_show_header_sub.helpers({
  organization() {
    let organization = {};

    if (FlowRouter._current.route.name.startsWith('organizations.')) {
      const organizationId = FlowRouter.getParam('_id');
      organization = Organizations.findOne({ _id: organizationId });
    }

    if (FlowRouter._current.route.name.startsWith('apps.')) {
      const appId = FlowRouter.getParam('_id');
      const app = Apps.findOne({ _id: appId });
      if (app) {
        organization = Organizations.findOne({ _id: app.organizationId });
      }
    }

    if (FlowRouter._current.route.name.startsWith('licenses.')) {
      const licenseId = FlowRouter.getParam('_id');
      const license = Licenses.findOne({ _id: licenseId });
      if (license) {
        organization = Organizations.findOne({ _id: license.organizationId });
      }
      const organizationId = FlowRouter.getParam('_id');
      organization = Organizations.findOne({ _id: organizationId });
    }

    const currentRoute = FlowRouter.current().route;
    const subtitle = currentRoute.options.title || currentRoute.name || '';
    const orgName = organization ? organization.name : 'Organization';
    SEO.set({ title: `${subtitle} – ${orgName} – accessibility.cloud` });

    return organization;
  },
});
