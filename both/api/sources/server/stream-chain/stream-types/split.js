import EventStream from 'event-stream';
import { check, Match } from 'meteor/check';

export class Split {
  constructor({ string, regExpString }) {
    check(string, Match.Optional(String));
    check(regExpString, Match.Optional(String));
    const matcher = string || (regExpString ? new RegExp(regExpString) : undefined);
    this.stream = EventStream.split(matcher);
  }
}
