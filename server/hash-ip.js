
// @flow
import { Meteor } from 'meteor/meteor';
import JSSHA from 'jssha';

const IpAddressSalt = Meteor.settings.dataStorage.ipSalt || '';

if (Meteor.isProduction && !IpAddressSalt) {
  throw new Error('Meteor.settings.dataStorage.ipSalt is empty or unset');
}

// use non nsa sha3 family
const ipShaHasher = new JSSHA('SHA3-256', 'TEXT');

export function hashIp(ipAddress: string) {
  return ipShaHasher.getHash('HEX', `${ipAddress}${IpAddressSalt}`);
}
