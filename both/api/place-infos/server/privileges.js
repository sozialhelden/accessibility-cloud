import { isAdmin } from '/both/lib/is-admin';
import { PlaceInfos } from '../place-infos';

PlaceInfos.allow({
  insert: isAdmin,
  update: isAdmin,
  remove: isAdmin,
});

PlaceInfos.publicFields = {
  sourceId: 1,
  originalId: 1,
  lastSourceImportId: 1,
  data: 1,
};

PlaceInfos.helpers({
  editableBy: isAdmin,
});
