import Apps from '../apps';
import purgeOnFastly from '../../../../server/purgeOnFastly';


// This purges all API responses of an app obtained via app-based API tokens from Fastly when
// an app is changed or removed.

Apps.find().observeChanges({
  changed(_id) {
    purgeOnFastly([_id]);
  },
  removed(_id) {
    purgeOnFastly([_id]);
  },
});
