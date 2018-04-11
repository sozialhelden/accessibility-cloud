import includes from 'lodash/includes';
import omit from 'lodash/omit';
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';

import { Sources } from '../../../../sources/sources';
import { PlaceInfos } from '../../../../place-infos/place-infos';
import { EquipmentInfos } from '../../../../equipment-infos/equipment-infos';
import { Disruptions } from '../../../../disruptions/disruptions';

import Upsert from './upsert';
import { cacheEquipmentInPlaceInfo } from './upsert-equipment';


export default class UpsertDisruption extends Upsert {
  constructor(options) {
    super(options);
    this.stream.unitName = 'disruptions';
  }


  setUnreferencedEquipmentToWorking({ organizationSourceIds }, callback) {
    const selector = {
      'properties.sourceId': this.options.equipmentSourceId,
      'properties.disruptionSourceImportId': { $ne: this.options.sourceImportId },
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
    const result = super.postProcessBeforeUpserting(doc);
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

    const equipmentInfo = EquipmentInfos.findOne(equipmentInfoId);
    const { properties } = equipmentInfo;
    const { originalId, placeSourceId, originalPlaceInfoId } = properties;
    cacheEquipmentInPlaceInfo({
      originalId,
      placeSourceId,
      originalPlaceInfoId,
      organizationSourceIds,
    });

    callback(null, doc);
  }


  afterFlush({ organizationSourceIds }, callback) {
    const equipmentSourceId = this.options.equipmentSourceId;

    check(equipmentSourceId, Match.Optional(String));

    if (equipmentSourceId) {
      if (!includes(organizationSourceIds, equipmentSourceId)) {
        throw new Meteor.Error(401, 'Not authorized to use this equipment data source ID.');
      }
    }

    const updateStatsIfNecessary = () => {
      if (equipmentSourceId) {
        const source = Sources.findOne(equipmentSourceId);
        if (!source) {
          throw new Meteor.Error(404, 'Source not found.');
        }
        console.log('Updating equipment source stats...');
        const sourceImport = Sources.findOne(equipmentSourceId).getLastSuccessfulImport();
        if (sourceImport) {
          sourceImport.generateAndSaveStats();
        }
        callback();
      }
    };

    if (!this.options.setUnreferencedEquipmentToWorking) { updateStatsIfNecessary(callback); return; }
    this.setUnreferencedEquipmentToWorking({ organizationSourceIds }, (error) => {
      if (error) { callback(error); return; }
      updateStatsIfNecessary(callback);
    });
  }
}

UpsertDisruption.collection = Disruptions;
