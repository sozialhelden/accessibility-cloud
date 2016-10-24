import EventStream from 'event-stream';
import { check } from 'meteor/check';
import { ObjectProgressStream } from '../object-progress-stream';

export class ParseJSONChunks {
  constructor({ onProgress }) {
    check(onProgress, Function);
    this.stream = EventStream.parse();
    this.progressStream = new ObjectProgressStream(this.stream, onProgress);
  }
}
