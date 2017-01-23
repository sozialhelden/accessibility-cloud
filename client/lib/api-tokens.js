import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import { SHA256 } from 'meteor/sha';
import {
  ExpirationCheckInterval,
  DefaultExpirationTime,
} from '/both/lib/api-tokens';

let storedUserToken = null;


function expireApiTokenIfNecessary() {
  const now = new Date();
  if (storedUserToken && storedUserToken.expireDate <= now) {
    console.log('Expired stored API user token.');
    storedUserToken = null;
  }
}


export function getApiUserToken(expirationTimeOrCallback, callbackOrNull) {
  expireApiTokenIfNecessary();

  const callback = (callbackOrNull || expirationTimeOrCallback);
  if (storedUserToken) {
    callback(null, storedUserToken.hashedToken);
    return;
  }

  const expirationTime = Match.test(expirationTimeOrCallback, Number) &&
    expirationTimeOrCallback ||
    DefaultExpirationTime;

  Meteor.call('getApiUserToken', expirationTime, (error, newUserToken) => {
    if (error) {
      console.error('Could not get API token for getting place infos over the API:', error);
      return;
    }
    const { clientSalt, token } = newUserToken;
    const hashedToken = SHA256(clientSalt + token); // eslint-disable-line new-cap
    storedUserToken = newUserToken;
    Object.assign(storedUserToken, { hashedToken });
    callback(error, hashedToken);
  });
}


Meteor.startup(() => {
  Meteor.setInterval(expireApiTokenIfNecessary, ExpirationCheckInterval / 2);
});
