import { check } from 'meteor/check';
import { PlaceInfos } from '../../../../place-infos/place-infos';


export default class ReimportSource {
  constructor({
    sourceId,
    onDebugInfo,
  }) {
    check(sourceId, String);
    check(onDebugInfo, Function);

    this.stream = PlaceInfos.rawCollection().find({ 'properties.sourceId': sourceId });
  }

  abort() {
    if (!this.request) return;
    this.request.abort();
  }

  dispose() {
    delete this.stream;
  }

  static getParameterSchema() {
    return { sourceId: { type: String } };
  }
}
