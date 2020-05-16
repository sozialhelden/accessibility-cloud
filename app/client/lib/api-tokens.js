import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';
import { SHA256 } from 'meteor/sha';
import {
  ExpirationCheckInterval,
  DefaultExpirationTime,
} from '/both/lib/api-tokens';

let storedUserToken = null;

Accounts.onLogout(() => {
  storedUserToken = null;
});

function expireApiTokenIfNecessary() {
  const now = new Date();
  if (storedUserToken && storedUserToken.expireDate <= now) {
    console.log('Expired stored API user token.');
    storedUserToken = null;
  }
}


export function getApiUserToken(expirationTime = DefaultExpirationTime) {
  check(expirationTime, Number);
  expireApiTokenIfNecessary();

  return new Promise((resolve, reject) => {
    if (storedUserToken) {
      resolve(storedUserToken.hashedToken);
      return;
    }

    Meteor.call('getApiUserToken', expirationTime, (error, newUserToken) => {
      if (error) {
        console.error('Could not get API token for getting place infos over the API:', error);
        reject(error);
        return;
      }
      const { clientSalt, token } = newUserToken;
      const hashedToken = SHA256(clientSalt + token); // eslint-disable-line new-cap
      storedUserToken = newUserToken;
      Object.assign(storedUserToken, { hashedToken });
      resolve(hashedToken);
    });
  });
}


Meteor.startup(() => {
  Meteor.setInterval(expireApiTokenIfNecessary, ExpirationCheckInterval / 2);
});
