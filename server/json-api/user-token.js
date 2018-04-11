import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Random } from 'meteor/random';
import { SHA256 } from 'meteor/sha';
import {
  MaxExpireInterval,
  ExpirationCheckInterval,
  DefaultExpirationTime,
} from '/both/lib/api-tokens';

const ApiTokens = new Mongo.Collection('apiTokens');


function generateToken(userId, expireTimeInMs) {
  console.log('Generating token for user', userId);
  const clientSalt = Random.secret();
  const token = Random.secret();
  const expireDate = new Date(+new Date() + expireTimeInMs);
  const hashedToken = SHA256(clientSalt + token); // eslint-disable-line new-cap
  return { userId, token, expireDate, clientSalt, hashedToken };
}

function storeToken({ userId, hashedToken, expireDate }) {
  ApiTokens.insert({ userId, hashedToken, expireDate });
}

function expireOldTokens() {
  const now = new Date();
  ApiTokens.remove({ expireDate: { $lt: now } });
}

export function getUserIdFromToken(hashedToken) {
  // console.log(`Trying to find userId for token '${hashedToken}'…`);
  const now = new Date();
  const tokenData = ApiTokens.findOne({ hashedToken, expireDate: { $gt: now } });
  return tokenData && tokenData.userId;
}

Meteor.methods({
  getApiUserToken(expireTimeInMs = DefaultExpirationTime) {
    if (!this.userId) {
      throw new Meteor.Error(401, 'Please login first.');
    }

    console.log('Expiration time', DefaultExpirationTime);
    check(expireTimeInMs, Number);
    const tokenData = generateToken(this.userId, Math.min(expireTimeInMs, MaxExpireInterval));
    const { token, expireDate, clientSalt, hashedToken } = tokenData;
    storeToken({ userId: this.userId, hashedToken, expireDate });
    return { token, expireDate, clientSalt };
  },
});

Meteor.startup(expireOldTokens);
Meteor.setInterval(expireOldTokens, ExpirationCheckInterval);
