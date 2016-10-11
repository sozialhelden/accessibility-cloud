import { Meteor } from 'meteor/meteor';

// Handle a GET HTTP request. The following variables are available inside the function:
//  }

export function GET({ collection, _id, userId }) {
  if (!collection) {
    throw new Meteor.Error(404, 'Collection not found.');
  }
  let selector = null;
  if (typeof collection.visibleSelectorFor === 'function') {
    selector = collection.visibleSelectorFor(userId);
  }
  if (!selector) {
    // This means the collection has to have a visibleSelectorFor() method defined
    // eslint-disable-next-line max-len
    throw new Meteor.Error(401, 'No allowed collection content defined.');
  }

  const options = { transform: null };
  if (typeof collection.findOptionsFor === 'function') {
    Object.assign(options, collection.findOptionsFor(userId) || {});
  }

  if (_id) {
    // Return single document
    selector = {
      $and: [
        { _id: _id },
        selector,
      ],
    };
    return collection.findOne(selector, options);
    // collection.find({
    //   geometry: {
    //     $nearSphere: {
    //       $geometry: {
    //         type: 'Point',
    //         coordinates: [ -73.93414657, 40.82302903 ],
    //       },
    //       $maxDistance: 5 * METERS_PER_MILE,
    //     },
    //   },
    // })
  }

  // Return array of documents
  return collection.find(selector, options).fetch();
}
