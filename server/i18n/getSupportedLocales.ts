import { union } from 'lodash';
import { check } from 'meteor/check';
import { HTTP } from 'meteor/http';

import { auth, projectSlug } from './meteorSettings';

export default function getSupportedLocales(
  resourceSlug: string,
  defaultLocale: string,
) {
  check(resourceSlug, String);
  const response = HTTP.get(
    `https://www.transifex.com/api/2/project/${projectSlug}/resource/${resourceSlug}/stats`,
    { auth },
  );
  if (response.statusCode !== 200) {
    const message = 'Error while determining locales on transifex.';
    console.error(message);
    console.error(response);
    return null;
  }
  const json = response.data;
  const remoteLocales = Object.keys(json)
    .filter(locale => locale.match(/[a-z]{2}(_[A-Z]{2})?/))
    .filter(locale => locale !== 'en') // 'en' is the source language on transifex.
    .sort();
  if (!remoteLocales.length) {
    console.log(
      'Resource not existing on transifex yet, no remote locales found.',
    );
  }
  const result = union([defaultLocale], remoteLocales);
  console.log('Got locales for', resourceSlug, 'from transifex:', result);
  return result;
}
