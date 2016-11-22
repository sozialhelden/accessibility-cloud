import util from 'util';

const { Transform } = Npm.require('zstreams');

export class DebugLog {
  constructor({ onDebugInfo }) {
    let logged = false;
    let lastChunk = null;
    this.stream = new Transform({
      writableObjectMode: true,
      readableObjectMode: true,
      transform(chunk, encoding, callback) {
        if (!logged) {
          onDebugInfo({ firstChunkInspectString: util.inspect(chunk) });
          logged = true;
        }
        lastChunk = chunk;
        callback(null, chunk);
      },
      flush(callback) {
        onDebugInfo({ lastChunkInspectString: util.inspect(lastChunk) });
        callback();
      },
    });
  }

  static getParameterSchema() {
    return {};
  }
}
