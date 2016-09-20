import { Meteor } from 'meteor/meteor';
import { PlaceInfos } from '../place-infos.js';

const options = { fields: PlaceInfos.publicFields };
Meteor.publish('placeInfos.public', () => PlaceInfos.find({}, options));
