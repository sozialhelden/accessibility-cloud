import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Sources } from '/both/api/sources/sources.js';

import subsManager from '/client/lib/subs-manager';

Template.sources_show_header_sub.onCreated(() => {
  subsManager.subscribe('organizations.public');
  subsManager.subscribe('sources.public');
  subsManager.subscribe('organizationMembers.public');
});


Template.sources_show_header_sub.helpers({
  source() {
    const source = Sources.findOne({ _id: FlowRouter.getParam('_id') });
    return source;
  },
});
