import EventStream from 'event-stream';
import { check } from 'meteor/check';
import { ObjectProgressStream } from '../object-progress-stream';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export class ParseJSONChunks {
  constructor({ onProgress }) {
    check(onProgress, Function);
    this.stream = EventStream.parse();
    this.progressStream = new ObjectProgressStream(this.stream, onProgress);
  }

  static getParameterSchema() {
    return new SimpleSchema({});
  }
}
