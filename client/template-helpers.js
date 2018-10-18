// import '/imports/startup/client';
// import '/imports/startup/both';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { _ } from 'meteor/underscore';
import isPlainObject from 'lodash/isPlainObject';
import s from 'meteor/underscorestring:underscore.string';
import { isApproved } from '/both/lib/is-approved';
import { isAdmin } from '/both/lib/is-admin';

Template.registerHelpers({
  FlowRouter,
  humanize: s.humanize,
  camelize: s.camelize,
  lowercase(str) {
    return String(str).toLowerCase();
  },
  uppercase(str) {
    return String(str).toUpperCase();
  },
  stringify(object) {
    return JSON.stringify(object, true, 2);
  },
  beautifyJSON(jsonString) {
    try {
      return JSON.stringify(JSON.parse(jsonString), true, 2);
    } catch (error) {
      return `Error: ${error}\n\nInterpreted string: ${jsonString}`;
    }
  },
  stringifyHuman(object) {
    if (!object) {
      return '';
    }
    return JSON
      .stringify(object, true, 2)
      .replace(/(\s*\[\n)|([\{\}\[\]",]*)/g, '')
      .replace(/\n\s\s/g, '\n');
  },
  _(str) {
    return str;
  },
  keyValue(object) {
    const result = [];
    _.each(object, (value, key) => result.push({ key, value }));
    return result;
  },
  isAdmin() {
    const userId = Meteor.userId();
    return userId && isAdmin(userId);
  },
  isApproved() {
    const userId = Meteor.userId();
    return userId && isApproved(userId);
  },
  userCanAccessPageWithCurrentApprovalState() {
    FlowRouter.watchPathChange();
    const userId = Meteor.userId();
    return FlowRouter.current().route.options.isAccessibleWithoutApproval ||
      userId && isApproved(userId);
  },
  activeIfRouteNameStartsWith(routeName) {
    FlowRouter.watchPathChange();
    return FlowRouter.current().route.name.startsWith(routeName) ? 'active' : '';
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
  formatNumber(n) {
    const number = Number(n);
    if (number.toLocaleString) {
      return number.toLocaleString('en-US');
    }
    return number.toString();
  },
  keyValues(object) {
    if (!isPlainObject(object)) { return []; }
    if (!object) { return []; }
    return Object.keys(object).map(key =>
      ({ key, value: object[key] })
    );
  },
});
