import { union } from 'lodash';
import getLocales from "./getLocales";
import returnNullIf404 from "./returnNullIf404";

export default function getSupportedLocales(resourceSlug: string, defaultLocale: string) {
  const remoteLocales = returnNullIf404(getLocales)(resourceSlug) || [];
  if (!remoteLocales.length) {
    console.log('Resource not existing on transifex yet, no remote locales found.');
  }
  return union([defaultLocale], remoteLocales);
}