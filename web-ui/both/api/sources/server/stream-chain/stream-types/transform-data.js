import EventStream from 'event-stream';
import entries from '/both/lib/entries';

function compileMapping(fieldName, javascript) {
  try {
    // replace for minimum security
    // eslint-disable-next-line no-eval
    return eval(`(row) => (${javascript})`);
  } catch (error) {
    console.error(`Illegal script for ${fieldName}:\n${error}`);
    return () => {};
  }
}

function compileMappings(mappings) {
  const result = {};
  for (const [fieldName, javascript] of entries(mappings)) {
    result[fieldName] = compileMapping(fieldName, javascript);
  }
  return result;
}

export class TransformData {
  constructor({ mappings }) {
    const compiledMappings = compileMappings(mappings);
    this.stream = EventStream.map((data, callback) => {
      const doc = {};
      for (const [fieldName, fn] of entries(compiledMappings)) {
        doc[fieldName] = fn(data);
      }
      doc.originalData = data;
      console.log(doc);
      callback(null, doc);
      return null;
    });
  }
}
