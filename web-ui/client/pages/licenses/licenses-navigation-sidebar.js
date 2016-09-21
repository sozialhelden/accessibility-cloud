import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Licenses } from '/both/api/licenses/licenses.js';
import { Organizations } from '/both/api/organizations/organizations.js';

// FIXME: not all required here
Template.licenses_navigation_sidebar.onCreated(function created() {
  this.autorun(() => {
    this.subscribe('licenses.public');
    this.subscribe('organizations.public');
    this.subscribe('sources.public');
  });
});

function getOrganizationForView () {
  if (FlowRouter._current.route.name === 'manage.organizations.show.licenses') {
    const organizationId = FlowRouter.getParam('_id');
    return Organizations.findOne({ _id: organizationId });
  }

  const licenseId = FlowRouter.getParam('_id');
  const license = Licenses.findOne({ _id: licenseId });
  if (license) {
    return Organizations.findOne({ _id: license.organizationId });
  }
  return {};
}

Template.licenses_navigation_sidebar.helpers({
  licenses() {
    const orga = getOrganizationForView();
    if (orga) {
      return Licenses.find({ organizationId: orga._id });
    }
    return {};
  },
  organization() {
    return getOrganizationForView();
  },
  activeIfCurrentLicense(_id) {
    return _id === FlowRouter.getParam('_id') ? 'active' : '';
  },
});
