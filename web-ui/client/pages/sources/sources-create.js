import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Organizations } from '/both/api/organizations/organizations.js';
import { Sources } from '/both/api/sources/sources.js';
import { AutoForm } from 'meteor/aldeed:autoform';

Template.sources_create_page.onCreated(function created() {
  window.Organizations = Organizations;
  window.Sources = Sources;

  this.autorun(() => {
    this.subscribe('sources.public');
    this.subscribe('organizations.public');
  });
});

const _helpers = {
  sourcesFormSchema() {
    return Sources.schema;
  },
  organization() {
    const orga = Organizations.findOne({ _id: FlowRouter.getParam('_id') });
    return orga;
  },
};

Template.sources_create_header.helpers(_helpers);
Template.sources_create_page.helpers(_helpers);

AutoForm.addHooks('insertSourceForm', {
  onSuccess(formType, _id) {
    FlowRouter.go('source.show', { _id });

    this.event.preventDefault();
    return false;
  },
});

