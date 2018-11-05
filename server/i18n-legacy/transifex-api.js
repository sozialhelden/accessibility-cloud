import gettextParser from 'gettext-parser';
import { Meteor } from 'meteor/meteor';
import { s } from 'meteor/underscorestring:underscore.string';
import { check } from 'meteor/check';
import { HTTP } from 'meteor/http';


const { projectSlug, username, password } = Meteor.settings.transifex;
const auth = `${username}:${password}`;


export function importFromTransifex(resourceSlug, locale) {
  check(resourceSlug, String);
  check(locale, String);

  console.log('Downloading new', locale, 'translations from transifex...');
  const response = HTTP.get(`https://www.transifex.com/api/2/project/${projectSlug}/resource/${resourceSlug}/translation/${locale}`, { auth });

  if (response.statusCode === 404) {
    return null;
  }

  if (response.statusCode !== 200) {
    const message = `Error while downloading ${locale} from transifex.`;
    console.error(message);
    console.error(response);
    throw new Meteor.Error(response.statusCode, message);
  }

  const json = response.data;

  return gettextParser.po.parse(json.content);
}


export function exportToTransifex({ resourceSlug, poFile, asSourceFile, isNewResource }) {
  check(resourceSlug, String);
  check(poFile, Object);
  check(asSourceFile, Boolean);
  check(isNewResource, Boolean);

  const locale = poFile.headers.language;
  const poFileString = gettextParser.po.compile(poFile).toString();

  let response;
  if (isNewResource) {
    const url = `https://www.transifex.com/api/2/project/${projectSlug}/resources/`;
    const uploadJSON = {
      slug: resourceSlug,
      name: s.humanize(resourceSlug),
      accept_translations: true,
      i18n_type: 'PO',
      categories: [],
      priority: 0,
      content: poFileString,
    };
    console.log('Creating new resource with', locale, 'translations on transifex...');
    response = HTTP.post(url, { auth, data: uploadJSON });
  } else {
    const url = `https://www.transifex.com/api/2/project/${projectSlug}/resource/${resourceSlug}/${asSourceFile ? 'content' : `translation/${locale}`}/`;
    const uploadJSON = { content: poFileString };
    console.log('Uploading', locale, 'translations to transifex...');
    response = HTTP.put(url, { auth, data: uploadJSON });
  }

  if (response && response.statusCode > 299) {
    const message = 'Error while uploading to transifex.';
    console.error(message);
    console.error(response);
    throw new Meteor.Error(response.statusCode, message);
  }

  console.log('Successfully uploaded', locale, 'translations.');
}

export function getLocales(resourceSlug) {
  check(resourceSlug, String);
  console.log('Getting remote locales for', resourceSlug, '...');

  const response = HTTP.get(
    `https://www.transifex.com/api/2/project/${projectSlug}/resource/${resourceSlug}/stats`,
    { auth }
  );

  if (response.statusCode !== 200) {
    const message = 'Error while determining locales on transifex.';
    console.error(message);
    console.error(response);
    throw new Meteor.Error(response.statusCode, message);
  }

  const json = response.data;

  return Object.keys(json).filter(locale => locale.match(/[a-z][a-z]_[A-Z][A-Z]/));
}
