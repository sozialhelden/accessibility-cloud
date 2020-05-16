import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { PlaceInfos } from '../place-infos/place-infos';

export const Captchas = new Mongo.Collection('Captchas');

export const CaptchaLifetime = 60 * 5 * 1000;

Captchas.schema = new SimpleSchema({
  hashedIp: {
    type: String,
  },
  solution: {
    type: String,
  },
  appToken: {
    type: String,
  },
  timestamp: {
    type: Date,
  },
});

Captchas.attachSchema(Captchas.schema);

Captchas.helpers({
  getPlace() {
    return PlaceInfos.findOne(this.placeId);
  },
});

Captchas.publicFields = {};

if (Meteor.isClient) {
  window.Captchas = Captchas;
}
