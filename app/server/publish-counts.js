import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { PlaceInfos } from '/both/api/place-infos/place-infos';

const collectionName = 'sourcesDocumentCounts';

Meteor.publish(collectionName, function publish(sourceId) {
  check(sourceId, String);

  const cursor = PlaceInfos.find({ 'properties.sourceId': sourceId });

  let count = cursor.count();
  this.added(collectionName, sourceId, { count });
  this.ready();

  const interval = Meteor.setInterval(() => {
    const newCount = cursor.count();
    if (newCount !== count) {
      count = newCount;
      this.changed(collectionName, sourceId, { count });
    }
  }, 10000);

  // Stop observing the cursor when client unsubs.
  // Stopping a subscription automatically takes
  // care of sending the client any removed messages.
  this.onStop(() => clearInterval(interval));
});
