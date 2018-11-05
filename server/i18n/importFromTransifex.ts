import * as gettextParser from 'gettext-parser';
import { check } from 'meteor/check';
import { HTTP } from 'meteor/http';
import { projectSlug, auth } from './meteorSettings';

export default function importFromTransifex(resourceSlug, locale) {
  check(resourceSlug, String);
  check(locale, String);

  console.log('Downloading new', locale, 'translations from transifex...');
  const response = HTTP.get(`https://www.transifex.com/api/2/project/${projectSlug}/resource/${resourceSlug}/translation/${locale}`, { auth });

  if (response.statusCode === 404) {
    // This is not an error.
    return null;
  }

  if (response.statusCode !== 200) {
    const message = `Error while downloading ${locale} from transifex.`;
    console.error(message);
    console.error(response);
    return null;
  }

  const json = response.data;

  return gettextParser.po.parse(json.content);
}



