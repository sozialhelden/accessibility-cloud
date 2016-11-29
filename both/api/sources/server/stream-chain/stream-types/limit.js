const { LimitStream } = Npm.require('zstreams');
import { check } from 'meteor/check';

export class Limit {
  constructor({ limit = 3 }) {
    check(limit, Number);
    this.stream = new LimitStream(limit, { objectMode: true });
    this.stream.on('pipe', source => {
      source.on('length', length => this.stream.emit('length', Math.max(length, limit)));
    });
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
