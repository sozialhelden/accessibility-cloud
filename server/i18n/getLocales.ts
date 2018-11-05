import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { HTTP } from 'meteor/http';

import { projectSlug, auth } from './meteorSettings';

export default function getLocales(resourceSlug: string) {
  check(resourceSlug, String);
  console.log('Getting remote locales for', resourceSlug, '...');
  const response = HTTP.get(`https://www.transifex.com/api/2/project/${projectSlug}/resource/${resourceSlug}/stats`, { auth });
  if (response.statusCode !== 200) {
    const message = 'Error while determining locales on transifex.';
    console.error(message);
    console.error(response);
    throw new Meteor.Error(response.statusCode, message);
  }
  const json = response.data;
  return Object.keys(json).filter(locale => locale.match(/[a-z][a-z]_[A-Z][A-Z]/));
}