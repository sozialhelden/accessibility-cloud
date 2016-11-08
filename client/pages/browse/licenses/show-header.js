import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Sources } from '/both/api/sources/sources.js';
import { Organizations } from '/both/api/organizations/organizations.js';
import { Licenses } from '/both/api/licenses/licenses.js';

import subsManager from '/client/lib/subs-manager';
import { helpers } from '/client/_layouts/helpers.js';

Template.licenses_show_header.onCreated(() => {
  subsManager.subscribe('licenses.public');
  subsManager.subscribe('organizations.public');
  window.Licenses = Licenses;
  window.Organizations = Organizations;
});


Template.licenses_show_header.helpers(helpers);

Template.licenses_show_header.helpers({
  license() {
    return Licenses.findOne({ _id: FlowRouter.getParam('_id') });
  },
});
