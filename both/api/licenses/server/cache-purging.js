import Licenses from '../licenses';
import purgeOnFastly from '../../../../server/purgeOnFastly';

// This automatically purges place JSON responses of this license, as all place responses
// have a license included

Licenses.find().observeChanges({
  changed(_id) {
    purgeOnFastly([_id]);
  },
  removed(_id) {
    purgeOnFastly([_id]);
  },
});
