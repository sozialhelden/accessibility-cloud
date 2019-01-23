
import Organizations from '../organizations';
import Sources from '../../sources/sources';
import purgeOnFastly from '../../../../server/purgeOnFastly';

function purgeSourcesOfOrganizationId(organizationId) {
  const sources = Sources.find({ organizationId }, { transform: null, fields: { _id: 1 } });
  purgeOnFastly(sources.map(s => s._id));
}

// This purges all API responses that include organization info if specific fields of the
// organization are changed or the organization is removed.

Organizations.find().observeChanges({
  changed(_id, fields) {
    const fieldsTriggeringPurge = [
      'name',
      'webSite',
      'tocForOrganizationsAccepted',
    ];
    // Purge all cached source + PoI information of this organization
    if (fieldsTriggeringPurge.find(fieldName => Object.keys(fields).find(fieldName))) {
      purgeOnFastly([_id]);
      purgeSourcesOfOrganizationId(_id);
    }
  },
  removed(_id) {
    purgeOnFastly([_id]);
    purgeSourcesOfOrganizationId(_id);
  },
});
