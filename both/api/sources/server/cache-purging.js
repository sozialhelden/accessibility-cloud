import { Meteor } from 'meteor/meteor';
import { Sources } from '../sources';
import sendPurgeRequestToFastly from '../../../../server/cdn-purging/sendPurgeRequestToFastly';

// This purges all API responses that include data from a source when specific fields of the
// source are changed or the source is removed.
Meteor.startup(() => {
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
        sendPurgeRequestToFastly([_id]);
      }
    },
    removed(_id) {
      sendPurgeRequestToFastly([_id]);
    },
  });
});
