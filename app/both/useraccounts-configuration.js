import { AccountsTemplates } from 'meteor/useraccounts:core';
import { TAPi18n } from 'meteor/tap:i18n';

/**
 * The useraccounts package must be configured for both client and server to work properly.
 * See the Guide for reference (https://github.com/meteor-useraccounts/core/blob/master/Guide.md)
 */

AccountsTemplates.configure({
  showForgotPasswordLink: true,
  texts: {
    errors: {
      loginForbidden: TAPi18n.__('Incorrect username or password'),
      pwdMismatch: TAPi18n.__('Passwords don\'t match'),
    },
    title: {
      signIn: TAPi18n.__('Sign In'),
      signUp: TAPi18n.__('Create your personal account'),
    },
  },
  defaultTemplate: 'Auth_page',
  defaultLayout: 'App_body',
  defaultContentRegion: 'main',
  defaultLayoutRegions: {},
  negativeFeedback: false,
  negativeValidation: true,
  positiveValidation: true,
  positiveFeedback: true,
  showValidating: true,
});

AccountsTemplates.configureRoute('signIn', {
  name: 'signin',
  path: '/signin',
});

AccountsTemplates.configureRoute('signUp', {
  name: 'join',
  path: '/join',
});

AccountsTemplates.configureRoute('forgotPwd');

AccountsTemplates.configureRoute('resetPwd', {
  name: 'resetPwd',
  path: '/reset-password',
});

AccountsTemplates.addField({
  _id: 'tocForUserAccepted',
  type: 'checkbox',
  displayName: 'I have read and understood the Terms and Conditions',
  errStr: 'You must agree to the Terms and Conditions.',
  required: true,
  template: 'customCheckboxTemplate',

  func(value) {
    return !value;
  },
});
