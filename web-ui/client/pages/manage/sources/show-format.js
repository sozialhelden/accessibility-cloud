import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Sources } from '/both/api/sources/sources.js';

import subsManager from '/client/lib/subs-manager';


Template.sources_show_format_page.onCreated(() => {
  subsManager.subscribe('manage-subscriptions-for-current-user');

  // window.SourceImports = SourceImports; // FIXME: we don't need that only for debugging
});

const helpers = {
  source() {
    return Sources.findOne({ _id: FlowRouter.getParam('_id') });
  },
};

// Template.sources_show_header.helpers(helpers);
Template.sources_show_format_page.helpers(helpers);

Template.sources_show_format_page.events({
  'click button.save': function saveButtonClicked(event) {
    event.preventDefault();

    const _id = FlowRouter.getParam('_id');
    const newStreamChainText = $('textarea#streamChain')[0].value;
    const newStreamChain = JSON.parse(newStreamChainText);

    Sources.update(_id, {
      $set: { streamChain: newStreamChain },
    });
  },
});
