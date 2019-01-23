import Sources from '../sources';
import purgeOnFastly from '../../../../server/purgeOnFastly';

// This purges all API responses that include data from a source when specific fields of the
// source are changed or the source is removed.

Sources.find().observeChanges({
  changed(_id, fields) {
    const fieldsTriggeringPurge = [
      'organizationId',
      'translations.additionalAccessibilityInformation.en_US',
      'name',
      'shortName',
      'licenseId',
      'description',
      'originWebsiteURL',
      'isDraft',
      'isFreelyAccessible',
      'isRequestable',
      'accessRestrictedTo',
    ];
    if (fieldsTriggeringPurge.find(fieldName => fields[fieldName])) {
      purgeOnFastly([_id]);
    }
  },
  removed(_id) {
    purgeOnFastly([_id]);
  },
});
