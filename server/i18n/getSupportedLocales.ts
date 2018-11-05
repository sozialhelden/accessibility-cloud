import { union } from 'lodash';
import getLocales from "./getLocales";
import returnNullIfFunctionThrows404 from "./returnNullIfFunctionThrows404";

export default function getSupportedLocales(resourceSlug: string, defaultLocale: string) {
  const remoteLocales = returnNullIfFunctionThrows404(getLocales)(resourceSlug) || [];
  if (!remoteLocales.length) {
    console.log('Resource not existing on transifex yet, no remote locales found.');
  }
  return union([defaultLocale], remoteLocales);
}