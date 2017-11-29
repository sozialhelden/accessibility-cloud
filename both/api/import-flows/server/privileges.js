import { isAdmin } from '/both/lib/is-admin';
import { ImportFlows } from '../import-flows.js';
import { Sources } from '../../sources/sources';

const canEditSource = (userId, doc) => {
  const { sourceId } = doc;
  const source = Sources.findOne(sourceId);

  return source.isEditableBy(userId);
};

ImportFlows.allow({
  insert: canEditSource,
  update: canEditSource,
  remove: canEditSource,
});

ImportFlows.deny({
  update(userId, source, fields) {
    // only admins are allowed to change automatic imports
    if (!isAdmin(userId) && (fields.includes('schedule') || fields.includes('isAutomatic'))) {
      return true;
    }

    // Don't allow to change this flag on the client
    return fields.includes('lastImportStartedByUserId');
  },
});
