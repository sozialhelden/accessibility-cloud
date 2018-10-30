import { Apps } from '../apps';
import { getLocalTranslation, setLocalTranslation, getMsgidsToTranslationDescriptors } from './localTranslationAccessors';
import makeCollectionTranslatable from '../../../../server/i18n-new/makeCollectionTranslatable';


makeCollectionTranslatable({
  getLocalTranslation,
  setLocalTranslation,
  getMsgidsToTranslationDescriptors,
  collection: Apps,
});
