import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Sources } from '/both/api/sources/sources.js';
import { SourceImports } from '/both/api/source-imports/source-imports.js';

import subsManager from '/client/lib/subs-manager';


Template.sources_show_imports_page.onCreated(() => {
  
  subsManager.subscribe('sourceImports.public');

  window.SourceImports = SourceImports; // FIXME: we don't need that only for debugging
});


Template.sources_show_header.helpers({
  source() {
    return Sources.findOne({ _id: FlowRouter.getParam('_id') });
  },

});
