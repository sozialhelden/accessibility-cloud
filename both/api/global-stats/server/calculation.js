import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { GlobalStats } from '../global-stats';
import { PlaceInfos } from '/both/api/place-infos/place-infos';
import { Sources } from '/both/api/sources/sources';
import { Organizations } from '/both/api/organizations/organizations';

export function saveCount(collection) {
  check(collection, Mongo.Collection);
  const value = collection.find().count();
  GlobalStats.insert({ name: `${collection._name}.count`, date: new Date(), value });
  console.log(`${value} ${collection._name} in total.`);
}

export function calculateGlobalStats() {
  [
    Meteor.users,
    PlaceInfos,
    Sources,
    Organizations,
  ].forEach(saveCount);
}
