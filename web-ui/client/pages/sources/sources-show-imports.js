import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Sources } from '/both/api/sources/sources.js';
import { SourceImports } from '/both/api/source-imports/source-imports.js';

import subsManager from '/client/lib/subs-manager';

Template.sources_show_imports_page.onCreated(() => {
  subsManager.subscribe('sources.public');
  subsManager.subscribe('organizations.public');
  subsManager.subscribe('sourceImports.public');

  window.SourceImports = SourceImports;	// FIXME: we don't need that only for debugging
});


Template.sources_show_header.helpers({
  source() {
    return Sources.findOne(FlowRouter.getParam('_id'));
  },
});

Template.sources_show_imports_page.events({
  'click .btn.start-import'(event) {
    event.preventDefault();

    Meteor.call('sources.startImport', FlowRouter.getParam('_id'), (err, result) => {
      if (err) {
        console.log(err);
      } else {
        FlowRouter.go('manage.sources.show.imports', {
          _id: FlowRouter.getParam('_id'),
          importId: result,
        });
      }
    });
  },
});

Template.sources_show_imports_page.helpers({
  activeIfCurrentImport(sourceId) {
    return FlowRouter.getParam('importId') === sourceId ? 'active' : '';
  },
  sourceImports() {
    return SourceImports.find({ sourceId: FlowRouter.getParam('_id') });
  },
  source() {
    return Sources.findOne(FlowRouter.getParam('_id'));
  },
  sourceImport() {
    const selectedImport = SourceImports.findOne(FlowRouter.getParam('importId'));
    if (selectedImport) {
      return selectedImport;
    }
    return SourceImports.findOne({ sourceId: FlowRouter.getParam('_id') });
  },
});
