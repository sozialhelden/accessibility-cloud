import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Sources } from '/both/api/sources/sources.js';

import { Licenses } from '/both/api/licenses/licenses.js';
import { Languages } from '/both/api/languages/languages.js';

import { _ } from 'meteor/underscore';
import subsManager from '/client/lib/subs-manager';

Template.sources_show_settings_page.onCreated(function created() {
  window.Sources = Sources;
  subsManager.subscribe('organizations.public');
  subsManager.subscribe('sources.public');
  subsManager.subscribe('licenses.public');
  subsManager.subscribe('languages.public');
});


Template.sources_show_settings_page.events({
  'click .js-delete'() {
    if (!confirm('Do you really want to delete this source and all of its imported places?')) {
      return;
    }
    const sourceId = FlowRouter.getParam('_id');
    Meteor.call('deleteSourceWithId', sourceId, (error) => {
      if (error) {
        alert('Could not delete source:', error.message);
      }
      FlowRouter.go('dashboard');
    });
  },

  'click .js-delete-places'() {
    if (!confirm('CAUTION: This will destroy all place IDs permanently, new imports will have places with new IDs and URLs! Do you really want to delete all imported places for this source? If you need a reimport because data is changed, a manual migration of the changes in the DB is a better idea and leaves URLs and IDs permanently reachable.')) {
      return;
    }
    const sourceId = FlowRouter.getParam('_id');
    Meteor.call('deleteAllPlacesOfSourceWithId', sourceId, (error) => {
      if (error) {
        alert('Could not delete places:', error.message);
      }
    });
  },

  'click .js-generate-stats'() {
    const sourceId = FlowRouter.getParam('_id');
    Meteor.call('Sources.generateAndSaveStats', sourceId, { skipGlobalStats: true }, (error) => {
      if (error) {
        alert('Could not generate statistics:', error.message);
      }
    });
  },
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
      if (license.shortName) {
        licenseName += ' (' + license.shortName + ')';
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
