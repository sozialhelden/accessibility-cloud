import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { isAdmin } from '/both/lib/is-admin';

import {
  checkExistenceAndFullAccessToSourceId,
} from '/both/api/sources/server/privileges';

import { ImportFlows } from '../import-flows';


function checkPreconditions(userId: string, importFlowId: string): ?{} {
  const importFlow = ImportFlows.findOne(importFlowId);
  if (!importFlow) throw new Meteor.Error(404, 'Import flow not found');
  const { sourceId } = importFlow;
  checkExistenceAndFullAccessToSourceId(userId, sourceId);
  return importFlow;
}


Meteor.methods({
  'ImportFlows.stopAutomaticImports'(importFlowId) {
    check(importFlowId, String);
    const importFlow = checkPreconditions(this.userId, importFlowId);
    importFlow.stopAutomaticImports();
  },

  'ImportFlows.scheduleAutomaticImport'(importFlowId, schedule) {
    check(importFlowId, String);
    check(schedule, String);

    const importFlow = checkPreconditions(this.userId, importFlowId);

    if (!isAdmin(this.userId)) {
      throw new Meteor.Error(401, 'Not authorized');
    }

    ImportFlows.update(importFlowId, { $set: { schedule } });

    importFlow.scheduleAutomaticImport(this.userId, schedule);
  },
});
