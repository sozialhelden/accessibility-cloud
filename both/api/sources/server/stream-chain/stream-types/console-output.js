import EventStream from 'event-stream';

export class ConsoleOutput {
  constructor() {
    this.stream = EventStream.mapSync((data) => {
      if (data instanceof Buffer) {
        console.log('Buffer:', data.toString('utf8'));
      } else {
        console.log(data);
      }
      return data;
    });
  }
}
