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
