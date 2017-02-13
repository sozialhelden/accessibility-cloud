/* global Meteor: true*/

import _ from 'lodash';

const timeoutMs = _.get(Meteor.settings, 'scripts.timeoutMs');

if (!timeoutMs) {
  throw new Error('Setting missing: scripts.timeoutMs. Please add it to your settings file.');
}

return Object.freeze({
  timeoutMs,
});
