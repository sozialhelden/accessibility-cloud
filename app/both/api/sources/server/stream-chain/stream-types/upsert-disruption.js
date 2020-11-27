import includes from 'lodash/includes';
import omit from 'lodash/omit';
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';

import { PlaceInfos } from '../../../../place-infos/place-infos';
import { EquipmentInfos } from '../../../../equipment-infos/equipment-infos';
import { Disruptions } from '../../../../disruptions/disruptions';

import Upsert from './upsert';
import takeEquipmentSnapshotForSourceId from '../../../../equipment-status-samples/takeEquipmentSnapshot';
import recordStatusChanges from '../../../../equipment-status-samples/recordStatusChanges';


export default class UpsertDisruption extends Upsert {
  constructor(options) {
    super(options);
    this.stream.unitName = 'disruptions';
    if (!options.equipmentSourceId) {
      throw new Error('Please add an `equipmentSourceId` parameter to the `UpsertDisruption` step.');
    }
    this.equipmentInfosBeforeImport = takeEquipmentSnapshotForSourceId(options.equipmentSourceId);
  }


  setUnreferencedEquipmentToWorking({ organizationSourceIds, equipmentSelectorForImport }, callback) {
    const selector = {
      $and: [
        {
          'properties.sourceId': this.options.equipmentSourceId,
          'properties.disruptionSourceImportId': { $ne: this.options.sourceImportId },
        },
        equipmentSelectorForImport || {},
      ],
    };

    const modifier = {
      $set: {
        'properties.isWorking': true,
      },
    };

    EquipmentInfos.update(selector, modifier, { multi: true }, (error, count) => {
      console.log(`Set ${count} missing equipment records to working `, selector, modifier);
      callback(error);
    });
  }


  // Associate the disruption information with a place data source and equipment info, if possible

  postProcessBeforeUpserting(doc, { organizationSourceIds, organizationName }) {
    const result = super.postProcessBeforeUpserting(doc, { organizationSourceIds, organizationName });
    const properties = result.properties;
    if (!properties) return result;

    properties.lastUpdate = new Date().toISOString();

    const placeSourceId = properties.placeSourceId;
    if (placeSourceId) {
      if (!includes(organizationSourceIds, placeSourceId)) {
        const message = `Not authorized: placeSourceId must refer to a data source by ${organizationName} (Allowed: ${organizationSourceIds}, given: ${placeSourceId})`;
        throw new Meteor.Error(401, message);
      }

      if (properties.originalPlaceInfoId) {
        const originalPlaceInfoIdField = properties.originalPlaceInfoIdField || 'properties.originalId';
        const selector = { 'properties.sourceId': placeSourceId, [originalPlaceInfoIdField]: properties.originalPlaceInfoId };
        const options = { transform: null, fields: { _id: true, geometry: true } };
        const placeInfo = PlaceInfos.findOne(selector, options);
        if (placeInfo) {
          // console.log('Copying geometry and placeInfoId into disruption from place', placeInfo, 'matching', selector);
          result.properties.placeInfoId = placeInfo._id;
          result.geometry = result.geometry || placeInfo.geometry;
        } else {
          console.log('No placeInfo matching', selector, 'found.');
        }
      }
    }

    const equipmentSourceId = properties.equipmentSourceId;
    if (equipmentSourceId) {
      if (!includes(organizationSourceIds, equipmentSourceId)) {
        const message = `Not authorized: equipmentSourceId must refer to a data source by ${organizationName} (Allowed: ${organizationSourceIds}, given: ${equipmentSourceId})`;
        throw new Meteor.Error(401, message);
      }

      if (properties.originalEquipmentInfoId) {
        const originalEquipmentInfoIdField = properties.originalEquipmentInfoIdField || 'properties.originalId';
        const selector = { 'properties.sourceId': equipmentSourceId, [originalEquipmentInfoIdField]: properties.originalEquipmentInfoId };
        const options = { transform: null, fields: { _id: true, geometry: true } };
        const equipmentInfo = EquipmentInfos.findOne(selector, options);
        if (equipmentInfo) {
          // console.log('Copying geometry and equipmentInfoId into disruption from equipmentInfo', equipmentInfo, 'matching', selector);
          result.properties.equipmentInfoId = equipmentInfo._id;
          result.geometry = result.geometry || equipmentInfo.geometry;
        } else {
          console.log('No equipment matching', selector, 'found.');
        }
      }
    }

    return result;
  }


  afterUpsert({ doc, organizationSourceIds }, callback) {
    if (!this.options.takeOverEquipmentWorkingFlag || !doc) { callback(null); return; }
    const equipmentInfoId = doc.properties.equipmentInfoId;
    if (!equipmentInfoId) { callback(null); return; }
    const selector = { _id: equipmentInfoId, 'properties.sourceId': { $in: organizationSourceIds } };
    const omittedDisruptionProperties = [
      'originalData',
      'category',
      'equipmentInfoId',
      'placeInfoId',
      'originalPlaceInfoId',
      'originalEquipmentInfoId',
    ];
    const modifier = { $set: {
      'properties.isWorking': doc.properties.isEquipmentWorking,
      'properties.disruptionSourceImportId': this.options.sourceImportId,
      'properties.lastDisruptionProperties': omit(doc.properties, omittedDisruptionProperties),
      'properties.lastUpdate': new Date().toISOString(),
    } };

    const result = EquipmentInfos.update(selector, modifier);
    console.log('Updated equipment working status', selector, modifier, result);

    callback(null, doc);
  }


  afterFlush({ organizationSourceIds, organization, source }, callback) {
    const { equipmentSourceId, equipmentSelectorForImport } = this.options;

    check(equipmentSourceId, Match.Optional(String));
    if (equipmentSourceId) {
      if (!includes(organizationSourceIds, equipmentSourceId)) {
        throw new Meteor.Error(401, `Can’t use equipment data source ID "${equipmentSourceId}" for purging unreferenced equipment. Data source must come from the same organization. Allowed IDs: ${organizationSourceIds}`);
      }
    }

    // Compare before / after `isWorking` states and record changes
    const done = () => {
      const equipmentInfosAfterImport = takeEquipmentSnapshotForSourceId(equipmentSourceId);
      recordStatusChanges({
        equipmentInfosAfterImport,
        source,
        organization,
        sourceImportId: this.options.sourceImportId,
        equipmentInfosBeforeImport: this.equipmentInfosBeforeImport,
      });

      delete this.equipmentInfosBeforeImport;
      this.purgeImportedDocsOnFastly();
      callback();
    };

    if (!this.options.setUnreferencedEquipmentToWorking) {
      done();
      return;
    }

    this.setUnreferencedEquipmentToWorking(
      { organizationSourceIds, equipmentSelectorForImport },
      done,
    );
  }
}

UpsertDisruption.collection = Disruptions;
