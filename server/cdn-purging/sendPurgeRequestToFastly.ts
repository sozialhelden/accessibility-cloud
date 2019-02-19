import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

export default function sendPurgeRequestToFastly(surrogateKeys: string[]) {
  if (!surrogateKeys.length) {
    return null;
  }
  const { fastlyKey = null, serviceId = null } = Meteor.settings.fastly || {};
  if (!fastlyKey) {
    console.log('Didn\'t purge', surrogateKeys.length, 'keys because no `fastlyKey` is set.');
    return null;
  }
  if (!serviceId) {
    console.log('Didn\'t purge', surrogateKeys, 'on Fastly because no `serviceId` is set.');
    return null;
  }
  const url = `https://api.fastly.com/service/${serviceId}/purge`;
  const options = {
    headers: {
      'Fastly-Key': fastlyKey,
      Accept: 'application/json',
      'Surrogate-Key': surrogateKeys.join(' '),
    },
  };
  const result = HTTP.post(url, options);
  if (result.statusCode === 200) {
    console.log(`Purged ${surrogateKeys.length} keys on Fastly.`);
  } else {
    console.log('Error while processing purge request on Fastly, result:', result);
  }
  return result;
}
