import { POFile } from './i18nTypes';

export default function generateEmptyPoFile(locale: string): POFile {
  return {
    headers: {
      language: locale,
      'content-type': 'text/plain; charset=utf-8',
      'plural-forms': 'nplurals=2; plural=(n!=1);',
    },
    translations: {},
  };
}