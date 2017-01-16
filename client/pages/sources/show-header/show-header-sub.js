import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Sources } from '/both/api/sources/sources.js';
import { SEO } from '/client/seo.js';

import subsManager from '/client/lib/subs-manager';

Template.sources_show_header_sub.onCreated(() => {
  subsManager.subscribe('organizations.public');
  subsManager.subscribe('sources.public');
  subsManager.subscribe('organizationMembers.public');
});


Template.sources_show_header_sub.helpers({
  source() {
    const source = Sources.findOne({ _id: FlowRouter.getParam('_id') });
    const currentRoute = FlowRouter.current().route;

    const subtitle = currentRoute.options.title || currentRoute.name || '';
    const sourceName = source ? source.name : 'Source';
    if (currentRoute && currentRoute.name === 'sources.show') {
      SEO.set({ title: `${sourceName} – Accessibility Cloud` });
    } else {
      SEO.set({ title: `${sourceName} – ${subtitle} – Accessibility Cloud` });
    }

    return source;
  },
});
