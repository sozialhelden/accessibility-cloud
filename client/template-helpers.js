// import '/imports/startup/client';
// import '/imports/startup/both';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { _ } from 'meteor/underscore';
import { s } from 'meteor/underscorestring:underscore.string';
import { OrganizationMembers } from '/both/api/organization-members/organization-members.js';
import { Organizations } from '/both/api/organizations/organizations.js';
import { Sources } from '/both/api/sources/sources.js';
import { Apps } from '/both/api/apps/apps.js';
import { isApproved } from '/both/lib/is-approved';

const helpers = {
  FlowRouter,
  humanize: s.humanize,
  camelize: s.camelize,
  uppercase(str) {
    return str.toUpperCase();
  },
  stringify(object) {
    return JSON.stringify(object, true, 4);
  },
  stringifyHuman(object) {
    if (!object) {
      return '';
    }
    return JSON.stringify(object, true, 2).replace(/(\s*\[\n)|([\{\}\[\]",]*)/g, '').replace(/\n\s\s/g, '\n');
  },
  _(str) {
    return str;
  },
  keyValue(object) {
    const result = [];
    _.each(object, (value, key) => result.push({ key, value }));
    return result;
  },

  // FIXME: this is a crude solution that might not scale correctly
  organizationsForCurrentUser() {
    const userId = Meteor.userId();
    const orgaIds = _.map(OrganizationMembers.find({ userId }).fetch(), function fetchOrgId(m) {
      return m.organizationId;
    });

    return Organizations.find({ _id: { $in: orgaIds } });
  },
  sourcesForCurrentUser() {
    const userId = Meteor.userId();
    const orgaIds = _.map(OrganizationMembers.find({ userId }).fetch(), function fetchOrgId(m) {
      return m.organizationId;
    });

    return Sources.find({ organizationId: { $in: orgaIds } });
  },
  appsForCurrentUser() {
    const userId = Meteor.userId();
    const orgaIds = _.map(OrganizationMembers.find({ userId }).fetch(), function fetchOrgId(m) {
      return m.organizationId;
    });

    return Apps.find({ organizationId: { $in: orgaIds } });
  },

  isAdmin() {
    const user = Meteor.user();
    return !!user && user.isAdmin;
  },
  isApproved() {
    const user = Meteor.user();
    return !!user && user.isApproved;
  },
  userCanAccessPageWithCurrentApprovalState(pageName) {
    const userId = Meteor.userId();
    const pagesAccessibleWithoutApproval = ['licenses_show_page', 'imprint_page'];
    return pagesAccessibleWithoutApproval.includes(pageName) || userId && isApproved(userId);
  },

  activeIfRouteNameBeginsWith(routeName) {
    FlowRouter.watchPathChange();
    const regExp = new RegExp(`^${routeName.replace(/\./g, '\\.')}`);
    return FlowRouter.current().route.name.match(regExp) ? 'active' : '';
  },
  activeIfRouteNameIs(routeName) {
    FlowRouter.watchPathChange();
    return routeName === FlowRouter.current().route.name ? 'active' : '';
  },
  activeIfRouteNameMatches(regex) {
    FlowRouter.watchPathChange();
    const currentRouteName = FlowRouter.current().route.name;
    return currentRouteName.match(regex) ? 'active' : '';
  },
  activeIfRouteGroupNameMatches(regex) {
    FlowRouter.watchPathChange();
    if (FlowRouter.current().route.group) {
      const groupName = FlowRouter.current().route.group.name;
      return groupName.match(new RegExp(regex, 'ig')) ? 'active' : '';
    }
    return false;
  },
};

_.each(helpers, (fn, name) => Template.registerHelper(name, fn));
