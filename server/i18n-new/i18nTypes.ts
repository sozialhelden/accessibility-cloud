// Defines the msgid to use in the .po file for a given attribute name and document.
// The function is curried so you can cache the outer function if it's more complex.
export type MsgidFn = (propertyName: string) => (doc: object | string) => string;

// Defines the path to a translatable property in a document in dot notation for lodash's `get`.
// The function is curried so you can cache the outer function if it's more complex.
export type PropertyPathFn = (propertyName: string) => (locale: string) => string;

export type TranslationDescriptor = {
  propertyName: string;
  propertyPathFn: PropertyPathFn;
  msgidFn: MsgidFn;
};

export type GetLocalTranslationOptions = {
  doc: object,
  locale: string,
  translationDescriptor: TranslationDescriptor,
}

export type SetLocalTranslationOptions = {
  doc: object,
  locale: string,
  translationDescriptor: TranslationDescriptor,
  msgstr: string,
  collection: any,
};

export type MsgidsToTranslationDescriptors = {
  [msgid: string]: {
    translationDescriptor: TranslationDescriptor,
    doc: object,
  }
};

export type POFile = {
  headers: {
    language: string,
    'content-type': string,
    'plural-forms': string,
  },
  translations: {
    [context: string]: {
      [msgid: string]: {
        msgstr: string[],
        msgid: string,
      },
    }
  },
}
