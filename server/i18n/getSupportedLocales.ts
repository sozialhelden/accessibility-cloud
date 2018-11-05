import { union } from 'lodash';
import getLocales from './getLocales';

export default function getSupportedLocales(resourceSlug: string, defaultLocale: string) {
  const remoteLocales = getLocales(resourceSlug) || [];
  if (!remoteLocales.length) {
    console.log('Resource not existing on transifex yet, no remote locales found.');
  }
  return union([defaultLocale], remoteLocales);
}