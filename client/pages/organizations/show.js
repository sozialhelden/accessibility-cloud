import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Organizations } from '/both/api/organizations/organizations.js';
import { Sources } from '/both/api/sources/sources.js';
import subsManager from '/client/lib/subs-manager';

Template.organizations_show_page.onCreated(function created() {
  subsManager.subscribe('organizations.public');
  subsManager.subscribe('sources.public');
});


Template.organizations_show_page.helpers({
  organization() {
    const orga = Organizations.findOne({ _id: FlowRouter.getParam('_id') });
    return orga;
  },
  organizations() {
    const orgCursor = Organizations.find({});
    return orgCursor;
  },
  isDraft() {
    return this.isDraft ? 'draft' : '';
  },
});
