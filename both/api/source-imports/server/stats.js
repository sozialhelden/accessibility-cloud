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

const attributeBlacklist = {
  properties: {
    _id: true,
    properties: {
      infoPageUrl: true,
      placeWebsiteUrl: true,
      editPageUrl: true,
      lastSourceImportId: true,
      sourceId: true,
      originalId: true,
      originalData: true,
      address: true,
      phoneNumber: true,
      name: true,
    },
    geometry: true,
  },
};

SourceImports.helpers({
  generateAndSaveStats(options) {
    const attributeDistribution = {};

    // Goes through all attributes of a document recursively
    // and increments the according values in `attributeDistribution`
    // to calculate each attribute value's frequency in the whole dataset.

    function exploreAttributesTree(rootKey, valueOrAttributes) {
      if (_.get(attributeBlacklist, rootKey) === true) {
        return;
      }
      if (rootKey.match(/Id$/i)) return;
      if (_.isObject(valueOrAttributes)) {
        Object.keys(valueOrAttributes).forEach((key) => {
          const childKey = rootKey ? (`${rootKey}.${key}`) : key;
          exploreAttributesTree(childKey, valueOrAttributes[key]);
        });
        return;
      }
      let distribution = _.get(attributeDistribution, rootKey);
      if (!distribution) {
        distribution = {};
        _.set(attributeDistribution, rootKey, distribution);
      }
      const value = valueOrAttributes;
      distribution[value] = (distribution[value] || 0) + 1;
    }

    const upsertStream = this.upsertStream();

    const collection = {
      UpsertDisruption: Disruptions,
      UpsertEquipment: EquipmentInfos,
    }[upsertStream.type] || PlaceInfos;

    const cursor = collection.find(
      { 'properties.sourceId': this.sourceId },
      { transform: null },
    );

    const documentCount = cursor.count();
    console.log('Analysing', documentCount, 'documents...');
    const startDate = new Date();

    cursor.forEach((doc) => {
      exploreAttributesTree('properties', doc);
    });

    const seconds = 0.001 * (new Date() - startDate);
    console.log(
      'Analysed',
      documentCount,
      `documents in ${seconds} seconds (${documentCount / seconds} docs/second).`,
    );

    // Uncomment this for debugging
    // console.log(
    //   'attributeDistribution:', util.inspect(attributeDistribution, { depth: 10, colors: true })
    // );

    const attributesToSet = {
      attributeDistribution: JSON.stringify(attributeDistribution),
      documentCountAfterImport: documentCount,
    };

    if (upsertStream) {
      if (upsertStream.debugInfo) {
        const debugInfo = upsertStream.debugInfo;
        attributesToSet.insertedDocumentCount = debugInfo.insertedDocumentCount || debugInfo.insertedPlaceInfoCount || 0;
        attributesToSet.updatedDocumentCount = debugInfo.updatedDocumentCount || debugInfo.updatedPlaceInfoCount || 0;
      }
      if (upsertStream.progress) {
        attributesToSet.processedDocumentCount = upsertStream.progress.transferred || 0;
      }
    }

    SourceImports.update(this._id, {
      $set: attributesToSet,
    });

    Sources.update(this.sourceId, { $set: { documentCount } });

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
