import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Disruptions } from '../disruptions';

const options = { fields: Disruptions.publicFields };


Meteor.publish('disruptions.single', function publish(disruptionId) {
  check(disruptionId, String);
  const selector = {
    $and: [
      { _id: disruptionId },
      Disruptions.visibleSelectorForUserId(this.userId),
    ],
  };
  return Disruptions.find(selector, options);
});
