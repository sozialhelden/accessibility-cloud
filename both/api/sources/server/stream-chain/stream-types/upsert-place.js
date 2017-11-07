import { PlaceInfos } from '/both/api/place-infos/place-infos';
import Upsert from './upsert';


export default class UpsertPlace extends Upsert {
  constructor(options) {
    super(options);
    this.stream.unitName = 'places';
  }
}

UpsertPlace.collection = PlaceInfos;
