import util from 'util';
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { PlaceInfos } from '/both/api/place-infos/place-infos';
import { SourceImports } from '/both/api/source-imports/source-imports';
import { Sources } from '/both/api/sources/sources';
import { _ } from 'lodash';
import { calculateGlobalStats } from '/both/api/global-stats/server/calculation';
import Fiber from 'fibers';
import { Disruptions } from '../../disruptions/disruptions';
import { EquipmentInfos } from '../../equipment-infos/equipment-infos';

SourceImports.helpers({
  generateAndSaveStats(options) {
    const source = Sources.findOne(this.sourceId);
    if (!source) throw new Error('Source not found');
    const { attributeDistribution, documentCount } = source.attributeDistribution();

    const attributesToSet = {
      attributeDistribution: JSON.stringify(attributeDistribution),
      documentCountAfterImport: documentCount,
    };

    const upsertStream = this.upsertStream();
    if (upsertStream) {
      if (upsertStream.debugInfo) {
        const debugInfo = upsertStream.debugInfo;
        Object.assign(attributesToSet, {
          insertedDocumentCount: debugInfo.insertedDocumentCount || debugInfo.insertedPlaceInfoCount || 0,
          updatedDocumentCount: debugInfo.updatedDocumentCount || debugInfo.updatedPlaceInfoCount || 0,
        });
      }
      if (upsertStream.progress) {
        attributesToSet.processedDocumentCount = upsertStream.progress.transferred || 0;
      }
    }

    SourceImports.update(this._id, {
      $set: attributesToSet,
    });

    Sources.update(this.sourceId, { $set: {
      documentCount,
      attributeDistribution: JSON.stringify(attributeDistribution),
    } });

    if (!options || !options.skipGlobalStats) {
      calculateGlobalStats();
    }

    return attributeDistribution;
  },
});

Meteor.methods({
  'SourceImports.generateAndSaveStats'(sourceImportId, options) {
    check(sourceImportId, String);
    check(options, Match.Optional({ skipGlobalStats: Match.Optional(Boolean) }));
    const sourceImport = SourceImports.findOne(sourceImportId);
    if (!this.userId) {
      throw new Meteor.Error(401, 'Please log in first.');
    }
    if (!sourceImport) {
      throw new Meteor.Error(404, 'Not found');
    }
    if (!sourceImport.editableBy(this.userId)) {
      throw new Meteor.Error(402, 'Not authorized');
    }
    this.unblock();
    Fiber(() => {
      sourceImport.generateAndSaveStats(options);
    }).run();
  },
});
