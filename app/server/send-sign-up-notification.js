import { Accounts } from 'meteor/accounts-base';
import { Email } from 'meteor/email';

Accounts.onCreateUser((options, user) => {
  console.log('Send notification email for signup:', user);
  try {
    const email = user && user.emails && user.emails[0] && user.emails[0].address;

    Email.send({
      from: 'support@accessibility.cloud',
      to: email,
      cc: 'support@accessibility.cloud',
      subject: 'Your sign-up on accessibility.cloud',
      text: `Hi,

I saw you signed up on http://accessibility.cloud. Great, thanks for your interest! I’m curious to learn what you plan to use it for!

We are a non-profit organization running accessibility.cloud and provide this service for free to other nonprofits. If you plan to use this commercially, let’s talk.

To get you started, here is the technical documentation for our service:
https://github.com/sozialhelden/accessibility-cloud/blob/master/README.md

Commercial or not — let me know if we shall set up a call to help you make this most useful for you. :)

Kind regards,
Holger

--

Holger Dieterich
Vorstand (Chairman)
Wheelmap.org Mitgründer (Co-Founder)

E-Mail: holger@sozialhelden.de
Tel.: +49-178-1870577
LinkedIn: https://www.linkedin.com/in/dieterich/
Twitter: http://www.twitter.com/sozialhelden
Facebook: http://www.facebook.com/sozialhelden

SOZIALHELDEN e.V., Invalidenstr. 65, 10557 Berlin, Germany
`,
    });
  } catch (error) {
    console.error('Could not send sign-up notification email:', error, error.stack);
  }
  return Object.assign({}, user, { isApproved: true });
});
