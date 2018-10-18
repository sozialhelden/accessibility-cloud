
export type MsgidFn = ((attributeName: string) => (doc: object) => string);
export type AttributePathFn = ((attributeName: string) => (locale: string) => string);

export type AttributeDescriptor = {
  attributeName: string;
  attributePathFn: AttributePathFn;
  msgidFn: MsgidFn;
};