import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { check } from 'meteor/check';

import { PlaceInfos } from '/both/api/place-infos/place-infos.js';
import { Sources } from '/both/api/sources/sources.js';
import { OrganizationMembers } from '/both/api/organization-members/organization-members.js';

Meteor.methods({
  getSomeGeoJSONPoints() {
    return [
      { type: 'Feature', geometry: { type: 'Point', coordinates: [-123.137, 49.25044] } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [-123.127, 49.25034] } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [-123.137, 49.25134] } },
    ];
  },
  getPointsForSource(sourceId, limitCount = 1000) {
    check(sourceId, String);
    check(limitCount, Number);
    return _.map(PlaceInfos.find({ sourceId }, { limit: limitCount }).fetch(), (pi) => ({
      type: 'Feature',
      geometry: pi.geometry,
    }));
  },
  getPlacesForSource(sourceId, limitCount = 1000) {
    check(sourceId, String);
    check(limitCount, Number);
    // return _.map(PlaceInfos.find({ sourceId }, { limit: limitCount }).fetch(), (pi) => ({
    //   type: 'Feature',
    //   geometry: pi.geometry,
    // }));
    return PlaceInfos.find({ sourceId }, { limit: limitCount }).fetch();
  },
  updateDataURLForSource(sourceId, url) {
    check(sourceId, String);
    check(url, String);

    const source = Sources.findOne({ _id: sourceId });
    if (!source) {
      throw new Meteor.Error(404, 'Source not found.');
    }

    if (!this.userId) {
      throw new Meteor.Error(401, 'Please authenticate first.');
    }
    const member = OrganizationMembers.find({
      userId: this.userId,
      organizationId: source.organizationId,
    });

    if (!member) {
      throw new Meteor.Error(401, 'Not authorized for given source.');
    }

    Sources.update(sourceId, { $set: {
      'streamChain.0.parameters.sourceUrl': url,
    } });// , { bypassCollection2: true });

    console.log('Updated source', sourceId, 'with new URL:', url);

    return true;
  },
});
