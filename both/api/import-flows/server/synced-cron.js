// @flow

import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { SyncedCron } from 'meteor/percolate:synced-cron';
import { ImportFlows } from '../import-flows';
import { Sources } from '../../sources/sources';
import { startImportIfPossible, abortImport } from '../../sources/server/stream-chain/control-import';

function jobName(importFlowId) {
  return `importFlow:${importFlowId}`;
}


function restartAutomaticImports() {
  const cursor = ImportFlows.find({ schedule: { $exists: true }, lastImportStartedByUserId: { $exists: true }})
  console.log('Found', cursor.count(), 'automatic import flows.');

  if (Meteor.settings.enableAutomaticImports === false) {
    console.log('Automatic imports are disabled in settings, cronjobs were not restarted.');
    return;
  }

  cursor.forEach((flow) => {
    console.log('Restarting automatic imports for import flow', flow._id, 'for source', flow.sourceId);
    flow.scheduleAutomaticImport(flow.lastImportStartedByUserId, flow.schedule);
  });
}


Meteor.startup(() => {
  SyncedCron.config({
    // Log job run details to console
    log: true,

    // Use a custom logger function (defaults to Meteor's logging package)
    logger: null,

    // Name of collection to use for synchronisation and logging
    collectionName: 'cronHistory',

    // Default to using localTime
    utc: true,

    /*
      TTL in seconds for history records in collection to expire
      NOTE: Unset to remove expiry but ensure you remove the index from
      mongo by hand

      ALSO: SyncedCron can't use the `_ensureIndex` command to modify
      the TTL index. The best way to modify the default value of
      `collectionTTL` is to remove the index by hand (in the mongo shell
      run `db.cronHistory.dropIndex({startedAt: 1})`) and re-run your
      project. SyncedCron will recreate the index with the updated TTL.
    */
    collectionTTL: 14 * 24 * 60 * 60,
  });

  SyncedCron.start();

  restartAutomaticImports();
});


ImportFlows.helpers({
  stopAutomaticImports() {
    const name = jobName(this._id);
    console.log('Removing job', name);
    SyncedCron.remove(name);
    ImportFlows.update(this._id, {
      $unset: {
        nextImportDate: true,
        schedule: true,
      },
    });
  },

  scheduleAutomaticImport(userId, schedule) {
    const importFlowId = this._id;
    const name = jobName(importFlowId);

    console.log('Adding job', name, 'with schedule', schedule, '…');

    [userId, importFlowId, schedule].forEach(field => check(field, String));

    ImportFlows.update(importFlowId, {
      $set: {
        lastImportStartedByUserId: userId,
        schedule,
      },
      $unset: {
        nextImportDate: true,
      },
    });

    SyncedCron.remove(name);

    SyncedCron.add({
      name,

      schedule(parser) {
        return parser.text(schedule); // parser is a later.parse object
      },

      job() {
        const flow = ImportFlows.findOne(importFlowId);

        if (!flow) {
          console.log('Removed job because import flow with id', importFlowId, 'does not exist');
          SyncedCron.remove(jobName(importFlowId));
          return;
        }

        flow.executeScheduledImport();

        ImportFlows.update(importFlowId, { $set: { nextImportDate: SyncedCron.nextScheduledAtDate(name) } });
      },
    });
    ImportFlows.update(importFlowId, { $set: { nextImportDate: SyncedCron.nextScheduledAtDate(name) } });
  },

  executeScheduledImport(callback: ((error?: Error) => void)) {
    const userId = this.lastImportStartedByUserId;
    if (!userId) {
      console.log('Cannot start import flow with id', this._id, 'because it has no user id.');
      return;
    }

    const user = Meteor.users.findOne(userId);
    if (!user) {
      console.log('Cannot start import flow with id', this._id, 'because its import user does not exist.');
      return;
    }

    const sourceId = this.sourceId;
    const source = Sources.findOne(sourceId);
    if (!source) {
      console.log('Cannot start import flow with id', this._id, 'because its source does not exist.');
      return;
    }

    abortImport(sourceId);

    const options = { userId, sourceId, importFlowId: this._id };

    startImportIfPossible(options, (error) => {
      if (error) {
        console.log('Error while starting import', options, ':', error);
        if (callback) callback(error);
        return;
      }

      if (callback) callback(null);
    });
  },
});
