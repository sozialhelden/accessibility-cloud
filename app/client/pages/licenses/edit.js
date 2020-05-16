import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { AutoForm } from 'meteor/aldeed:autoform';
import { Licenses } from '/both/api/licenses/licenses.js';
import { Languages } from '/both/api/languages/languages.js';
import subsManager from '/client/lib/subs-manager';

import { _ } from 'meteor/underscore';

Template.licenses_edit_page.onCreated(() => {
  window.Licenses = Licenses;

  subsManager.subscribe('sources.public');
  subsManager.subscribe('licenses.public');
  subsManager.subscribe('languages.public');
});

Template.licenses_edit_page.helpers({
  license() {
    return Licenses.findOne({ _id: FlowRouter.getParam('_id') });
  },

  languages() {
    const list = Languages.find({}).fetch();
    return _.map(list, language => ({
      label: language.name,
      value: language._id,
    }));
  },
});

AutoForm.addHooks('updateLicenseForm', {
  onSuccess() {
    FlowRouter.go('licenses.show', { _id: this.docId });

    this.event.preventDefault();
    return false;
  },
});
