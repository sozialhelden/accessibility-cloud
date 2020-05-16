
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';

import { publishPublicFields } from '/server/publish';
import { Images } from '../images.js';
import buildMongoQuery from '../filter-query';
import { PlaceInfos } from '../../place-infos/place-infos.js';

publishPublicFields('images', Images);

const FilterSchema = new SimpleSchema({
  withIp: {
    type: String,
    optional: true,
  },
  isReported: {
    type: Boolean,
    optional: true,
  },
  timestampFrom: {
    type: Number,
    optional: true,
  },
  timestampTo: {
    type: Number,
    optional: true,
  },
  sortBy: {
    type: String,
    optional: true,
  },
  skip: {
    type: Number,
    optional: true,
  },
  limit: {
    type: Number,
    optional: true,
  },
  sortByTimestamp: {
    type: Number,
    optional: true,
    allowedValues: [-1, 1],
  },
});

Meteor.publish('images.filtered', function publish(params) {
  check(params, Object);

  // Clean the data to remove whitespaces and have correct types
  FilterSchema.clean(params);
  // Throw ValidationError if something is wrong
  FilterSchema.validate(params);

  const queryParams = buildMongoQuery(params);

  const selector = {
    $and: [
      queryParams.filter,
      Images.visibleSelectorForUserId(this.userId),
    ],
  };

  const imageQuery = Images.find(selector, queryParams.options);
  const images = Images.find(selector, { fields: { objectId: 1 } });
  const placeIds = images ? images.map(a => a.objectId) : [];
  const placeQuery = PlaceInfos.find({ _id: { $in: placeIds } });

  return [imageQuery, placeQuery];
});

const publishCounter = (params) => {
  let count = 0;
  let init = true;
  const id = Random.id();
  const pub = params.handle;
  const collection = params.collection;
  const handle = collection.find(params.filter, params.options).observeChanges({
    added: () => {
      count += 1;
      if (!init) {
        pub.changed(params.name, id, { count });
      }
    },
    removed: () => {
      count -= 1;
      if (!init) {
        pub.changed(params.name, id, { count });
      }
    },
  });

  init = false;
  pub.added(params.name, id, { count });
  pub.ready();
  pub.onStop = () => handle.stop();
};


Meteor.publish('images.filteredCount', function(params) {
  check(params, Object);

  // Clean the data to remove whitespaces and have correct types
  FilterSchema.clean(params);
  // Throw ValidationError if something is wrong
  FilterSchema.validate(params);

  const queryParams = buildMongoQuery(params);

  const filter = {
    $and: [
      queryParams.filter,
      Images.visibleSelectorForUserId(this.userId),
    ],
  };

  return publishCounter({
    handle: this,
    name: 'images.filteredCount',
    collection: Images,
    filter,
  });
});
