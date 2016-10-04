import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Sources } from '/both/api/sources/sources.js';

import { Licenses } from '/both/api/licenses/licenses.js';
import { Languages } from '/both/api/languages/languages.js';

import { _ } from 'meteor/underscore';
import subsManager from '/client/lib/subs-manager';

Template.sources_show_settings_page.onCreated(function created() {
  window.Sources = Sources;

  subsManager.subscribe('sources.public');
  subsManager.subscribe('licenses.public');
  subsManager.subscribe('languages.public');
});

Template.sources_show_settings_page.helpers({
  source() {
    return Sources.findOne({ _id: FlowRouter.getParam('_id') });
  },

  // FIXME: is should be reused in sources-show-settings form.
  licenses() {
    const list = Licenses.find({}).fetch();
    return _.map(list, function(license) {
      let licenseName = license.name;
      if (license.version) {
        licenseName += + ' – ' + license.version;
      }
      if (license.shorthand) {
        licenseName += ' (' + license.shorthand + ')';
      }
      return {
        label: licenseName,
        value: license._id,
      };
    });
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

