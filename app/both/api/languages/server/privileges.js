import { isAdmin } from '/both/lib/is-admin';
import { Languages } from '../languages';

Languages.allow({
  insert: isAdmin,
  update: isAdmin,
  remove: isAdmin,
});

Languages.publicFields = {
  name: 1,
  languageCode: 1,
};

Languages.helpers({
  editableBy: isAdmin,
});

Languages.visibleSelectorForUserId = () => ({});
Languages.visibleSelectorForAppId = () => ({});
Languages.apiParameterizedSelector = ({ visibleContentSelector }) => visibleContentSelector;
