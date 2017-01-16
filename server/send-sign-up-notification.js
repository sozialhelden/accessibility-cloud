import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import { getDisplayedNameForUser } from '/both/lib/user-name';

Accounts.onCreateUser((options, user) => {
  console.log('Send notification email for signup:', user);
  try {
    const userName = getDisplayedNameForUser(user);
    Email.send({
      from: 'support@accessibility.cloud',
      to: 'support@accessibility.cloud',
      subject: `${userName} signed up on accessibility.cloud`,
      text: `Hi,

      ${userName} just signed up on accessibility.cloud.

      You can approve them here: ${Meteor.absoluteUrl('admin/admin')}

      Regards,
      Your friendly notification robots from accessibility.cloud.`,
    });
  } catch (error) {
    console.error('Could not send sign-up notification email:', error, error.stack);
  }
  return user;
});
