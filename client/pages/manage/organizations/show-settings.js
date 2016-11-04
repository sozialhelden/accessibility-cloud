import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { TAPi18n } from 'meteor/tap:i18n';
import { Organizations } from '/both/api/organizations/organizations.js';
import subsManager from '/client/lib/subs-manager';

Template.organizations_show_settings_page.onCreated(() => {
  window.Organizations = Organizations;

  subsManager.subscribe('organizations.public');
  subsManager.subscribe('sources.public');
});

Template.organizations_show_settings_page.helpers({
  organization() {
    return Organizations.findOne({ _id: FlowRouter.getParam('_id') });
  },
});


Template.organizations_show_settings_page.events({
  'click .js-delete'() {
    const text = 'Are you sure you want to delete this organization? This cannot be undone.';
    if (confirm(TAPi18n.__(text))) {
      Meteor.call(
        'organizations.remove',
        { organizationId: FlowRouter.getParam('_id') },
        (error) => {
          if (error) {
            alert('Could not remove organization:', error.reason);
            return;
          }
          FlowRouter.go('/');
        }
      );
    }
  },
});
