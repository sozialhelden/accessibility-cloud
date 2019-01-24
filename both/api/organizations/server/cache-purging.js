import { Meteor } from 'meteor/meteor';
import { Organizations } from '../organizations';
import { Sources } from '../../sources/sources';
import addKeysToFastlyPurgingQueue from '../../../../server/cdn-purging/addKeysToFastlyPurgingQueue';

function purgeSourcesOfOrganizationId(organizationId) {
  const sources = Sources.find({ organizationId }, { transform: null, fields: { _id: 1 } });
  addKeysToFastlyPurgingQueue(sources.map(s => s._id));
}

// This purges all API responses that include organization info if specific fields of the
// organization are changed or the organization is removed.
Meteor.startup(() => {
  Organizations.find().observeChanges({
    changed(_id, fields) {
      const fieldsTriggeringPurge = [
        'name',
        'webSite',
        'tocForOrganizationsAccepted',
      ];
      // Purge all cached source + PoI information of this organization
      if (fieldsTriggeringPurge.find(fieldName => fields[fieldName])) {
        addKeysToFastlyPurgingQueue([_id]);
        purgeSourcesOfOrganizationId(_id);
      }
    },
    removed(_id) {
      addKeysToFastlyPurgingQueue([_id]);
      purgeSourcesOfOrganizationId(_id);
    },
  });
});
