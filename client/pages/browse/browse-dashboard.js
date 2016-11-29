import { Template } from 'meteor/templating';
import { Organizations } from '/both/api/organizations/organizations.js';
import { Sources } from '/both/api/sources/sources.js';
import { isUserMemberOfOrganizationWithId } from '/both/api/organizations/privileges.js';
import { helpers } from '/client/_layouts/helpers';
import subsManager from '/client/lib/subs-manager';


Template.browse_dashboard_page.onCreated(() => {
  subsManager.subscribe('organizations.public');
  subsManager.subscribe('sources.public');
  subsManager.subscribe('licenses.public');
});

Template.browse_dashboard_page.helpers(helpers);

Template.browse_dashboard_page.helpers({
  isUserMemberOfOrganizationWithId,
  organizations() {
    return Organizations.find({});
  },
  sources() {
    return Sources.find({});
  },
});
