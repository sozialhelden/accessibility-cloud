import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { PlaceInfos } from '/both/api/place-infos/place-infos';
import { EquipmentInfos } from '/both/api/equipment-infos/equipment-infos';
import { Disruptions } from '/both/api/disruptions/disruptions';
import { SourceImports } from '/both/api/source-imports/source-imports';
import { ImportFlows } from '/both/api/import-flows/import-flows';
import { Sources } from '/both/api/sources/sources';
import {
  checkExistenceAndFullAccessToSourceId,
  checkExistenceAndVisibilityForSourceId,
} from '/both/api/sources/server/privileges';

Meteor.methods({
  getPlacesForSource(sourceId, limitCount = 1000) {
    check(sourceId, String);
    check(limitCount, Number);
    checkExistenceAndVisibilityForSourceId(this.userId, sourceId);

    return PlaceInfos.find({ 'properties.sourceId': sourceId }, { limit: limitCount }).fetch();
  },

  cachePlaceCountForSource(sourceId) {
    check(sourceId, String);
    checkExistenceAndVisibilityForSourceId(this.userId, sourceId);
    const documentCount = [
      PlaceInfos,
      EquipmentInfos,
      Disruptions,
    ].map(collection => collection.find({ 'properties.sourceId': sourceId }).count());
    Sources.update(sourceId, { $set: { documentCount } });
  },

  updateDataURLForImportFlow(importFlowId, url) {
    const importFlow = ImportFlows.findOne(importFlowId);

    check(importFlowId, String);
    check(url, String);
    checkExistenceAndFullAccessToSourceId(this.userId, importFlow.sourceId);

    ImportFlows.update(importFlowId, { $set: {
      'streams.0.parameters.sourceUrl': url,
    } });

    return true;
  },

  deleteSourceWithId(sourceId) {
    check(sourceId, String);
    checkExistenceAndFullAccessToSourceId(this.userId, sourceId);

    SourceImports.remove({ sourceId });
    PlaceInfos.remove({ 'properties.sourceId': sourceId });
    Sources.remove({ _id: sourceId });
  },

  deleteAllPlacesOfSourceWithId(sourceId) {
    check(sourceId, String);
    checkExistenceAndFullAccessToSourceId(this.userId, sourceId);

    PlaceInfos.remove({ 'properties.sourceId': sourceId });
    EquipmentInfos.remove({ 'properties.sourceId': sourceId });
    Disruptions.remove({ 'properties.sourceId': sourceId });
    Sources.update({ _id: sourceId }, { $set: { documentCount: 0 } });
  },
});
