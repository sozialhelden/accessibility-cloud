import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Organizations } from '/both/api/organizations/organizations.js';
import { Licenses } from '/both/api/licenses/licenses.js';

import subsManager from '/client/lib/subs-manager';

Template.organizations_show_header.onCreated(() => {
  subsManager.subscribe('organizations.public');
  subsManager.subscribe('sources.public');
  subsManager.subscribe('licenses.public');
});

Template.organizations_show_header.helpers({
  organization() {
    if (FlowRouter._current.route.name.startsWith('manage.organizations.show')) {
      const organizationId = FlowRouter.getParam('_id');
      return Organizations.findOne({ _id: organizationId });
    }

    const licenseId = FlowRouter.getParam('_id');
    const license = Licenses.findOne({ _id: licenseId });
    if (license) {
      return Organizations.findOne({ _id: license.organizationId });
    }
    return {};
  },
});
