import EventStream from 'event-stream';

export class ParseJSONChunks {
  constructor() {
    this.stream = EventStream.parse();
  }
}
