import { SyncedCron } from 'meteor/percolate:synced-cron';

import { Captchas, CaptchaLifetime } from '../captchas';

SyncedCron.add({
  name: 'CaptchaCleanup',

  schedule(parser) {
    return parser.recur().every(5).minute();
  },

  job() {
    const outdatedDuration = new Date(new Date().getTime() - (CaptchaLifetime));
    Captchas.remove({ timestamp: { $lt: outdatedDuration } });
  },
});
