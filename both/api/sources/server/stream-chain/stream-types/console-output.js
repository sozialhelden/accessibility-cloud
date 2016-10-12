import EventStream from 'event-stream';

export class ConsoleOutput {
  constructor() {
    this.stream = EventStream.mapSync((data) => {
      console.log(data);
      return data;
    });
  }
}
