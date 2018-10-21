
export type MsgidFn = (attributeName: string) => (doc: object | string) => string;

export type AttributePathFn = (attributeName: string) => (locale: string) => string;

export type TranslationFn = (locale, doc: object | string) => string;

export type AttributeDescriptor = {
  attributeName: string;
  attributePathFn: AttributePathFn;
  msgidFn: MsgidFn;
};