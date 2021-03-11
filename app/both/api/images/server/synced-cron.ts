import { SyncedCron } from 'meteor/percolate:synced-cron';
import { Email } from 'meteor/email';

import { Images, DefaultModerationFilter } from '../images';

SyncedCron.add({
  name: 'ImageModerationNotification',

  schedule(parser) {
    return parser.recur().on('08:00:00').time();
  },

  job() {
    const imagesAwaitingModeration = Images.find(DefaultModerationFilter).count();

    if (imagesAwaitingModeration > 0) {
      Email.send({
        from: 'support@accessibility.cloud',
        to: 'images@accessibility.cloud',
        subject: `${imagesAwaitingModeration} images awaiting moderation on accessibility.cloud`,
        text: `Hi,

there are currently ${imagesAwaitingModeration} images awaiting moderation.

You can approve them here: ${Meteor.absoluteUrl('admin/images')}

Regards,
Your friendly notification robots from accessibility.cloud.`,
      });
    }
  },
});
