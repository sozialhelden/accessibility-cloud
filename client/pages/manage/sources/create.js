import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Organizations } from '/both/api/organizations/organizations.js';
import { Licenses } from '/both/api/licenses/licenses.js';
import { Sources } from '/both/api/sources/sources.js';
import { Languages } from '/both/api/languages/languages.js';
import { AutoForm } from 'meteor/aldeed:autoform';
import { _ } from 'meteor/underscore';
import subsManager from '/client/lib/subs-manager';

Template.sources_create_page.onCreated(function created() {
  window.Organizations = Organizations;
  window.Sources = Sources;

  subsManager.subscribe('sources.public');
  subsManager.subscribe('organizations.public');
  subsManager.subscribe('licenses.public');
  subsManager.subscribe('languages.public');
});

const _helpers = {
  organization() {
    const orga = Organizations.findOne({ _id: FlowRouter.getParam('_id') });
    return orga;
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
};

Template.sources_create_header.helpers(_helpers);
Template.sources_create_page.helpers(_helpers);

AutoForm.addHooks('insertSourceForm', {
  onSuccess(formType, _id) {
    FlowRouter.go('manage.sources.show.format', { _id });

    this.event.preventDefault();
    return false;
  },
});
