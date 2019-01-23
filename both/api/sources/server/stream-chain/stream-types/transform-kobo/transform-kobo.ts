import { set, entries, pickBy } from 'lodash';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
  
const { Transform } = Npm.require('zstreams');

type KoboAttachment = {
  mimetype: string,
  download_url: string,
  filename: string,
  instance: number,
  id: number,
  xform: number,
};

type YesNoResult = 'true' | 'false' | 'undefined';

type KoboResult = {
  _uuid: string,
  _geolocation: [number, number],
  _attachments: KoboAttachment[],
  'outside/category/category_sub': string,
  'outside/category/category_top': string,
  'outside/entrance/has_automatic_door': YesNoResult,
  'outside/entrance/has_door': YesNoResult,
  'outside/entrance/has_entrance': YesNoResult,
  'outside/entrance/has_mobile_ramp': YesNoResult,
  'outside/entrance/has_steps': YesNoResult,
  'outside/entrance/picture': string,
  'outside/entrance/steps_count': string,
  'outside/entrance/steps_height': string,
  'outside/name': string,
  'user/user_measuring': 'inch' | 'cm',
  'user/user_record_type': string,
};

type FieldTypes = 'yesno' | 'hasSubObject' | 'float' | 'int';

const parseValue = (data: KoboResult, field: string, type: FieldTypes) => {
  const rawValue = data[field];
  if (rawValue === null || typeof rawValue === 'undefined') {
    return rawValue;
  }

  if (type === 'yesno') {
    if (rawValue === 'true') {
      return true;
    }
    return (rawValue === 'false' ? false : undefined);
  }

  if (type === 'hasSubObject') {
    if (rawValue === 'true') {
      return {};
    }
    return undefined;
  }

  if (type === 'float') {
    return parseFloat(rawValue);
  }

  if (type === 'int') {
    return parseInt(rawValue, 10);
  }

  return undefined;
};

const parseYesNo = (data: KoboResult, field: string) => {
  return parseValue(data, field, 'yesno');
};

const parseHasSubObject = (data: KoboResult, field: string) => {
  parseValue(data, field, 'hasSubObject');
};

const parseFloatUnit = (
  data: KoboResult, field: string, unit: string, operator?: string) => {
  const value = parseValue(data, field, 'float');
  // remove undefined values
  const unitValue = pickBy({
    operator,
    unit,
    value,
  });
  return (value && !isNaN(value)) ? unitValue : undefined;
};

const parseIntUnit = (
  data: KoboResult, field: string, unit: string, operator?: string) => {
  const value = parseValue(data, field, 'int');
  // remove undefined values
  const unitValue = pickBy({
    operator,
    unit,
    value,
  });
  return (value && !isNaN(value)) ? unitValue : undefined;
};

const parse = (data: KoboResult) => {
  const mapping = {
    geometry: { coordinates: data._geolocation.reverse(), type: 'Point' },
    'properties.originalId': data._uuid,
    'properties.infoPageUrl': null,
    'properties.originalData': JSON.stringify(data),
    'properties.name': data['outside/name'],
    'properties.category':
      data['outside/category/category_top'] || data['outside/category/category_sub'] || 'undefined',
    'properties.accessibility.entrances.0':
      parseHasSubObject(data, 'outside/entrance/has_entrance'),
    'properties.accessibility.entrances.0.stairs.0':
      parseHasSubObject(data, 'outside/entrance/has_steps'),
    'properties.accessibility.entrances.0.stairs.0.count':
      parseValue(data, 'outside/entrance/steps_count', 'int'),
    'properties.accessibility.entrances.0.stairs.0.stepHeight':
      parseFloatUnit(data, 'outside/entrance/steps_height', data['user/user_measuring']),
    'properties.accessibility.entrances.0.hasRemovableRamp':
      parseYesNo(data, 'outside/entrance/has_mobile_ramp'),
    'properties.accessibility.entrances.0.doors.0':
      parseYesNo(data, 'outside/entrance/has_door'),
    'properties.accessibility.entrances.0.doors.0.isAutomaticOrAlwaysOpen':
      parseYesNo(data, 'outside/entrance/has_automatic_door'),
  };

  const result = {};
  for (const [key, value] of entries(mapping)) {
    if (typeof value !== 'undefined') {
      set(result, key, value);
    }
  }

  // TODO apply a11y ratings

  // TODO retrieve attachments

  return result;
};

// transforms a result from an AC kobo survey to ac format
export default class TransformKobo {
  stream: any;
  source: any;

  lengthListener = (length: number) => this.stream.emit('length', length);

  pipeListener = (source: any) => {
    this.source = source;
    source.on('length', this.lengthListener);
  }

  constructor({
    onDebugInfo = (data: any) => {},
  }) {

    this.stream = new Transform({
      writableObjectMode: true,
      readableObjectMode: true,
      transform(data: KoboResult,
                encoding: string,
                callback: (error: Error, result?: any) => void) {
        try {
          const output = parse(data);
          callback(null, output);
        } catch (error) {
          this.emit('error', error);
          callback(error);
        }
      },
    });

    this.stream.on('pipe', this.pipeListener);
    this.stream.unitName = 'objects';
  }

  dispose() {
    if (this.stream) {
      if (this.pipeListener) {
        this.stream.removeListener('pipe', this.pipeListener);
      }
      delete this.stream;
    }
    if (this.pipeListener) {
      delete this.pipeListener;
    }
    if (this.source) {
      if (this.lengthListener) {
        this.source.removeListener('length', this.lengthListener);
      }
      delete this.source;
    }
    if (this.lengthListener) {
      delete this.lengthListener;
    }
  }

  static getParameterSchema() {
    return new SimpleSchema({});
  }
}
