export type MsgidFn = (
  propertyName: string,
) => (doc: object | string) => string;

export type PropertyPathFn = (
  propertyName: string,
) => (locale: string) => string;

export type TranslationDescriptor = {
  // Name of the property to translate. Used to identify a string in a document.
  propertyName: string;
  // Defines the path to a translatable property in a document in dot notation for lodash's `get`.
  // The function is curried so you can cache the outer function if it's more complex.
  propertyPathFn: PropertyPathFn;
};

export type GetLocalTranslationOptions = {
  doc: object;
  locale: string;
  propertyName: string;
};

// This function takes a locale (e.g. `en_US`), a MongoDB document and a translation descriptor and
// must return a the local translated string.
export type GetLocalTranslationFn = (
  options: GetLocalTranslationOptions,
) => string;

export type SetLocalTranslationOptions = {
  doc: object;
  locale: string;
  propertyName: string;
  msgstr: string;
};

// Sets a local translation to a new string value.
export type SetLocalTranslationFn = (
  options: SetLocalTranslationOptions,
) => void;

export type MsgidsToTranslationDescriptors = {
  [msgid: string]: {
    propertyName: string;
    doc: object;
  };
};

export type MsgidsToTranslationDescriptorsFn = (() => MsgidsToTranslationDescriptors);

export type POFile = {
  headers: {
    language: string;
    'content-type': string;
    'plural-forms': string;
  };
  translations: {
    [context: string]: {
      [msgid: string]: {
        msgstr: string[];
        msgid: string;
      };
    };
  };
};

// Defines how to find or change strings when syncing with transifex.

export interface TranslationStrategy {
  getLocalTranslation: GetLocalTranslationFn;
  setLocalTranslation: SetLocalTranslationFn;
  getMsgidsToTranslationDescriptors: MsgidsToTranslationDescriptorsFn;
}
