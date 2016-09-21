import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Sources } from '/both/api/sources/sources.js';
import { Licenses } from '/both/api/licenses/licenses.js';
import { Languages } from '/both/api/languages/languages.js';

import { _ } from 'meteor/underscore';

Template.licenses_edit_page.onCreated(function created() {
  window.Licenses = Licenses;

  this.autorun(() => {
    this.subscribe('sources.public');
    this.subscribe('licenses.public');
    this.subscribe('languages.public');
  });
});

Template.licenses_edit_page.helpers({
  license() {
    return Licenses.findOne({ _id: FlowRouter.getParam('_id') });
  },

  languages() {
    const list = Languages.find({}).fetch();
    return _.map(list, function(language) {
      return {
        label: language.name,
        value: language._id,
      };
    });
  },
});