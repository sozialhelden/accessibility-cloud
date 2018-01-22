const XPathStream = Npm.require('xpath-stream');

// https://github.com/nbqx/xpath-stream

export default class ParseXMLStream {
  constructor({ path, objectDefinition }) {
    check(path, String);
    check(objectDefinition, Match.ObjectIncluding())
    this.stream = new XPathStream(path, objectDefinition);
    this.stream.unitName = 'chunks';
  }

  dispose() {
    delete this.stream;
  }

  static getParameterSchema() {
    return {
      path: { type: String },
      objectDefinition: { type: Object, blackbox: true },
    };
  }
}
