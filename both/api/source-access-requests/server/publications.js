import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { SourceAccessRequests } from '../source-access-requests.js';

const options = { fields: SourceAccessRequests.publicFields };

Meteor.publish('sourceAccessRequests.single', requesterId => {
  check(requesterId, String);

  const selector = { requesterId };

  return SourceAccessRequests.find(selector, options);
});

Meteor.publish('sourceAccessRequests.forSource', sourceId => {
  check(sourceId, String);

  const selector = { sourceId };

  return SourceAccessRequests.find(selector, options);
});
