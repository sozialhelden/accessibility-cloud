import { Disruptions } from '/both/api/disruptions/disruptions';
import Upsert from './upsert';


export default class UpsertDisruption extends Upsert {
  constructor(options) {
    super(options);
    this.stream.unitName = 'disruptions';
  }
}

UpsertDisruption.collection = Disruptions;
