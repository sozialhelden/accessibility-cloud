import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Organizations } from '/both/api/organizations/organizations';
import { Sources } from '/both/api/sources/sources.js';
import { isUserMemberOfOrganizationWithId } from '/both/api/organizations/privileges.js';
import { helpers } from '/client/_layouts/helpers';
import subsManager from '/client/lib/subs-manager';
import { getDisplayedNameForUser } from '/both/lib/user-name';
import { getIconHTMLForUser } from '/both/lib/user-icon';
import { TAPi18n } from 'meteor/tap:i18n';

import { Images, DefaultModerationFilter } from '../../../both/api/images/images';

Template.admin_page.onCreated(() => {
  subsManager.subscribe('organizations.public');
  subsManager.subscribe('sources.public');
  subsManager.subscribe('licenses.public');
  subsManager.subscribe('images.public');
  if (Meteor.user().isAdmin) {
    subsManager.subscribe('users.needApproval');
  }
});

Template.admin_page.helpers(helpers);

Template.admin_page.helpers({
  isUserMemberOfOrganizationWithId,
  organizations() {
    return Organizations.find({}, { sort: { name: 1 }});
  },
  sources() {
    return Sources.find({});
  },
  imageBadge() {
    return Images.find(DefaultModerationFilter).count();
  },
  usersWaitingForApproval() {
    return Meteor.users.find({ isApproved: false }).fetch();
  },
  getUserName() {
    return getDisplayedNameForUser(this);
  },
  getIconHTML() {
    return getIconHTMLForUser(this);
  },
});

Template.admin_page.events({
  'click .js-approve-user'(event) {
    Meteor.call('users.approve', this._id);
    event.preventDefault();
  },
  'click .js-remove-user'(event) {
    // eslint-disable-next-line no-alert
    if (confirm(TAPi18n.__('Do you really want to remove this user?'))) {
      Meteor.call('users.remove', this._id);
    }
    event.preventDefault();
  },
  'click .js-sync-translations'() {
    Meteor.call('Categories.syncWithTransifex');
    Meteor.call('Sources.syncWithTransifex');
    Meteor.call('acFormat.syncWithTransifex');
  },
  'click .js-sync-app-translations'() {
    Meteor.call('Apps.syncWithTransifex');
    Meteor.call('AppLinks.syncWithTransifex');
  },
});
