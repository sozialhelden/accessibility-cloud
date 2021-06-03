import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

export default function sendPurgeRequestToFastly(surrogateKeys: string[]) {
  if (!surrogateKeys.length) {
    return null;
  }
  const { fastlyKey = null, serviceIds = null } = Meteor.settings.fastly || {};
  if (!fastlyKey) {
    console.log('Didn\'t purge', surrogateKeys.length, 'keys because no `fastlyKey` is set.');
    return null;
  }
  if (!serviceIds) {
    console.log('Didn\'t purge', surrogateKeys, 'on Fastly because no `serviceId` is set.');
    return null;
  }

  check(serviceIds, [String]);

  const results = serviceIds.map((serviceId: string) => {
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
      console.log('Purged', surrogateKeys, 'for service', serviceId, 'on Fastly.');
    } else {
      console.log(
        'Error while processing purge request for',
        surrogateKeys,
        'on Fastly for service',
        serviceId,
        '- result:',
        result
      );
    }
    return result;
  });

  return results;
}
