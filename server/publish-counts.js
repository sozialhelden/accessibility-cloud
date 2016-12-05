import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { PlaceInfos } from '/both/api/place-infos/place-infos';


Meteor.publish('sourcesPlaceInfoCounts', function publish(sourceId) {
  check(sourceId, String);

  const cursor = PlaceInfos.find({ sourceId });

  let count = cursor.count();
  this.added('sourcesPlaceInfoCounts', `count-${sourceId}`, { count });
  this.ready();

  const interval = Meteor.setInterval(() => {
    const newCount = cursor.count();
    if (newCount !== count) {
      count = newCount;
      this.changed('sourcesPlaceInfoCounts', `count-${sourceId}`, { count });
    }
  }, 5000);
  // Stop observing the cursor when client unsubs.
  // Stopping a subscription automatically takes
  // care of sending the client any removed messages.
  this.onStop(() => clearInterval(interval));
});
