import EventStream from 'event-stream';

export class DebugLog {
  constructor({ onDebugInfo }) {
    this.stream = EventStream.mapSync((inputData) => {
      onDebugInfo({
        inputData: inputData instanceof Buffer ? inputData.toString('utf8') : inputData,
      });
      return inputData;
    });
  }

  static getParameterSchema() {
    return {};
  }
}
