import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Sources } from '/both/api/sources/sources.js';

import subsManager from '/client/lib/subs-manager';

Template.sources_show_page.onCreated(() => {
  subsManager.subscribe('sources.public');
  subsManager.subscribe('organizations.public');
});

Template.sources_show_header.helpers({
  source() {
    const orga = Sources.findOne({ _id: FlowRouter.getParam('_id') });
    return orga;
  },
});

Template.sources_show_page.helpers({
});
