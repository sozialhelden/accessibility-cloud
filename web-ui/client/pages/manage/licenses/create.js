import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Organizations } from '/both/api/organizations/organizations.js';
import { Licenses } from '/both/api/licenses/licenses.js';
import { AutoForm } from 'meteor/aldeed:autoform';

Template.licenses_create_page.onCreated(function created() {
  window.Organizations = Organizations;
  window.Licenses = Licenses;

  this.autorun(() => {
    this.subscribe('organizations.public');
    this.subscribe('licenses.public');
  });
});

const _helpers = {
  organization() {
    const orga = Organizations.findOne({ _id: FlowRouter.getParam('_id') });
    return orga;
  },
};

Template.licenses_create_page.helpers(_helpers);

AutoForm.addHooks('insertLicenseForm', {
  onSuccess(formType, _id) {
    FlowRouter.go('manage.licenses.show', { _id });

    this.event.preventDefault();
    return false;
  },
});
