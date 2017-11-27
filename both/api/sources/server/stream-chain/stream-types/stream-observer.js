export type StreamObserverOptions = {
  sourceId: string,
  source: object,
  lastSuccessfulImport: string,
  sourceImportId: string,
  onDebugInfo: ({[string]: ?any} => void),
}

export default class StreamObserver {
  options: StreamObserverOptions
  constructor(options: StreamObserverOptions) {
    this.options = options;
  }
}
