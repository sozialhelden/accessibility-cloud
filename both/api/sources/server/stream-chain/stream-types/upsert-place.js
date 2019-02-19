import { get } from 'lodash';
import { PlaceInfos } from '/both/api/place-infos/place-infos';
import Upsert from './upsert';

export default class UpsertPlace extends Upsert {
  constructor(options) {
    super(options);
    this.stream.unitName = 'places';
  }

  postProcessBeforeUpserting(doc, { organizationSourceIds, organizationName }) {
    const result = super.postProcessBeforeUpserting(doc, {
      organizationSourceIds,
      organizationName,
    });
    if (get(result, 'properties.accessibility')) {
      result.properties.hasAccessibility = true;
    }
    return result;
  }
}

UpsertPlace.collection = PlaceInfos;
