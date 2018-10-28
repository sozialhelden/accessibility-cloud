export type MsgidFn = (attributeName: string) => (doc: object | string) => string;

export type AttributePathFn = (attributeName: string) => (locale: string) => string;

export type TranslationFn = (locale, doc: object | string) => string;

export type AttributeDescriptor = {
  attributeName: string;
  attributePathFn: AttributePathFn;
  msgidFn: MsgidFn;
};

export type GetterOptions = {
  doc: object,
  locale: string,
  attributeDescriptor: AttributeDescriptor,
}

export type SetterOptions = {
  doc: object,
  locale: string,
  attributeDescriptor: AttributeDescriptor,
  msgstr: string,
  collection: any,
};

export type MsgidsToDocs = {
  [msgid: string]: {
    attributeDescriptor: AttributeDescriptor,
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



