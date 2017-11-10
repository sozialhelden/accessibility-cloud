
import { check } from 'meteor/check';

const { LimitStream } = Npm.require('zstreams');

export default class Limit {
  constructor({ limit = 3 }) {
    check(limit, Number);
    this.stream = new LimitStream(limit, { objectMode: true });
    this.lengthListener = length => this.stream.emit('length', Math.max(length, limit));
    this.pipeListener = source => {
      this.source = source;
      source.on('length', this.lengthListener);
    };
    this.stream.on('pipe', this.pipeListener);
  }

  dispose() {
    this.stream.removeListener('pipe', this.pipeListener);
    delete this.pipeListener;
    this.source.removeListener('length', this.lengthListener);
    delete this.lengthListener;
    delete this.stream;
  }

  static getParameterSchema() {
    return {
      limit: {
        type: Number,
        defaultValue: 3,
      },
    };
  }
}
