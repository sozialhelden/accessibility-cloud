import { set, setWith, entries, pickBy, includes } from 'lodash';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const { Transform } = Npm.require('zstreams');

import {
  flatStepHeight,
  wheelChairWashBasin,
  evaluateWheelmapA11y,
  evaluateToiletWheelmapA11y } from './wheelmap-a11y-ruleset';

export type KoboAttachment = {
  mimetype: string,
  download_url: string,
  filename: string,
  instance: number,
  id: number,
  xform: number,
};

type YesNoResult = 'true' | 'false' | 'undefined';

export type KoboResult = {
  _id: number,
  _uuid: string,
  _geolocation: [number, number],
  _attachments: KoboAttachment[],
  username: string,
  'user/user_measuring': 'inch' | 'cm',
  'user/user_record_type': string,
  'outside/category/category_sub': string,
  'outside/category/category_top': string,
  'outside/entrance/has_automatic_door': YesNoResult,
  'outside/entrance/has_door': YesNoResult,
  'outside/entrance/has_entrance': YesNoResult,
  'outside/entrance/has_mobile_ramp': YesNoResult,
  'outside/entrance/has_steps': YesNoResult,
  'outside/entrance/steps_low_height': YesNoResult,
  'outside/entrance/picture': string,
  'outside/entrance/steps_count': string,
  'outside/entrance/steps_height': string,
  'outside/name': string,
  'inside/toilet/basin_wheelchair_fits_belows': YesNoResult,
  'inside/toilet/basin_wheelchair_reachable': YesNoResult,
  'inside/toilet/door_width': string,
  'inside/toilet/free_space_front': string,
  'inside/toilet/free_space_left': string,
  'inside/toilet/free_space_right': string,
  'inside/toilet/has_arm_rests': string,
  'inside/toilet/has_basin': YesNoResult,
  'inside/toilet/has_toilet': YesNoResult,
  'inside/toilet/seat_height': string,
  'inside/toilet/stepless_access': YesNoResult,
  'inside/toilet/toilet_photo': string,
  'inquire/are_service_animals_allowed': YesNoResult,
  'inquire/media/has_audio': YesNoResult,
  'inquire/media/has_braille': YesNoResult,
  'inquire/media/has_large_print': YesNoResult,
  'inquire/staff_can_speak_sign_lang': YesNoResult,
  'inquire/staff_has_disabled_training': YesNoResult,
  'inquire/staff_spoken_sign_langs': string,
};

// make keys typesafe to prevent typos
export type KoboKey = keyof KoboResult;

type FieldTypes = 'yesno' | 'float' | 'int';

const parseValue = (data: KoboResult, field: KoboKey, type: FieldTypes) => {
  const rawValue = data[field];
  if (rawValue === null || typeof rawValue === 'undefined') {
    return rawValue;
  }

  if (typeof rawValue !== 'string') {
    return undefined;
  }

  if (type === 'yesno') {
    if (rawValue === 'true') {
      return true;
    }
    return (rawValue === 'false' ? false : undefined);
  }

  if (type === 'float') {
    return parseFloat(rawValue);
  }

  if (type === 'int') {
    return parseInt(rawValue, 10);
  }

  return undefined;
};

const parseYesNo = (data: KoboResult, field: KoboKey) => {
  return parseValue(data, field, 'yesno');
};

const parseHasWithDefault = (data: KoboResult, field: KoboKey,
                             existsValue: any, doesNotExistValue: any) => {
  const value = parseValue(data, field, 'yesno');

  if (value === true) {
    return existsValue;
  }

  if (value === false) {
    return doesNotExistValue;
  }

  return undefined;
};

const parseHasArray = (data: KoboResult, field: KoboKey) => {
  return parseHasWithDefault(data, field, [], null);
};

const parseHasEntry = (data: KoboResult, field: KoboKey) => {
  return parseHasWithDefault(data, field, {}, null);
};

const parseIsAnyOfWithDefault = (data: KoboResult, field: KoboKey, list: string[],
                                 existsValue: any, doesNotExistValue: any) => {
  const rawValue = data[field];
  if (rawValue === null || typeof rawValue === 'undefined') {
    return rawValue;
  }

  return includes(list, rawValue) ? existsValue : doesNotExistValue;
};

const parseIsAnyOf = (data: KoboResult, field: KoboKey, list: string[]) => {
  return parseIsAnyOfWithDefault(data, field, list, true, false);
};

const parseIsAnyOfEntry = (data: KoboResult, field: KoboKey, list: string[]) => {
  return parseIsAnyOfWithDefault(data, field, list, {}, null);
};

const parseFloatUnit = (data: KoboResult, field: KoboKey,
                        unit: string, operator?: string) => {
  const value = parseValue(data, field, 'float') as number;
  // remove undefined values
  const unitValue = pickBy({
    operator,
    unit,
    value,
  });
  return (value && !isNaN(value)) ? unitValue : undefined;
};

const parseIntUnit = (data: KoboResult, field: KoboKey,
                      unit: string, operator?: string) => {
  const value = parseValue(data, field, 'int')  as number;
  // remove undefined values
  const unitValue = pickBy({
    operator,
    unit,
    value,
  });
  return (value && !isNaN(value)) ? unitValue : undefined;
};

const parseMultiSelect = (data: KoboResult, field: KoboKey) => {
  const rawValue = data[field];
  if (rawValue === null || typeof rawValue === 'undefined') {
    return rawValue;
  }
  if (typeof rawValue !== 'string') {
    return undefined;
  }

  return rawValue.split(' ');
};

const parse = (data: KoboResult) => {
  const usedLengthUnit = data['user/user_measuring'] || 'cm';

  const mapping = {
    geometry: { coordinates: data._geolocation.reverse(), type: 'Point' },
    'properties.originalId': `${data._id}`,
    'properties.infoPageUrl': null,
    'properties.originalData': JSON.stringify(data),
    // basic place data
    'properties.name': data['outside/name'],
    'properties.category':
      data['outside/category/category_top'] || data['outside/category/category_sub'] || 'undefined',
    // entrances
    'properties.accessibility.entrances':
      parseHasArray(data, 'outside/entrance/has_entrance'),
    'properties.accessibility.entrances.0':
      parseHasEntry(data, 'outside/entrance/has_entrance'),
    // stairs
    'properties.accessibility.entrances.0.stairs':
      parseHasArray(data, 'outside/entrance/has_steps'),
    'properties.accessibility.entrances.0.stairs.0':
      parseHasEntry(data, 'outside/entrance/has_steps'),
    'properties.accessibility.entrances.0.stairs.0.count':
      parseValue(data, 'outside/entrance/steps_count', 'int'),
    'properties.accessibility.entrances.0.stairs.0.stepHeight':
      parseFloatUnit(data, 'outside/entrance/steps_height', usedLengthUnit) ||
      parseHasWithDefault(data, 'outside/entrance/steps_low_height', flatStepHeight, undefined),
    'properties.accessibility.entrances.0.hasRemovableRamp':
      parseYesNo(data, 'outside/entrance/has_mobile_ramp'),
    // doors
    'properties.accessibility.entrances.0.doors':
      parseHasArray(data, 'outside/entrance/has_door'),
    'properties.accessibility.entrances.0.doors.0':
      parseHasEntry(data, 'outside/entrance/has_door'),
    'properties.accessibility.entrances.0.doors.0.isAutomaticOrAlwaysOpen':
      parseYesNo(data, 'outside/entrance/has_automatic_door'),
    // restrooms
    'properties.accessibility.restrooms':
      parseHasArray(data, 'inside/toilet/has_toilet'),
    'properties.accessibility.restrooms.0':
      parseHasEntry(data, 'inside/toilet/has_toilet'),
    // entrance
    'properties.accessibility.restrooms.0.entrance.isLevel':
      parseYesNo(data, 'inside/toilet/stepless_access'),
    'properties.accessibility.restrooms.0.entrance.door.width':
      parseFloatUnit(data, 'inside/toilet/door_width', usedLengthUnit),
    // toilet
    'properties.accessibility.restrooms.0.toilet':
      parseHasEntry(data, 'inside/toilet/has_toilet'),
    'properties.accessibility.restrooms.0.toilet.heightOfBase':
      parseFloatUnit(data, 'inside/toilet/seat_height', usedLengthUnit),
    'properties.accessibility.restrooms.0.toilet.spaceOnUsersLeftSide':
      parseFloatUnit(data, 'inside/toilet/free_space_front', usedLengthUnit),
    'properties.accessibility.restrooms.0.toilet.spaceOnUsersRightSide':
      parseFloatUnit(data, 'inside/toilet/free_space_left', usedLengthUnit),
    'properties.accessibility.restrooms.0.toilet.spaceInFront':
      parseFloatUnit(data, 'inside/toilet/free_space_right', usedLengthUnit),
    // handles
    'properties.accessibility.restrooms.0.toilet.hasFoldingHandles':
      parseIsAnyOf(data, 'inside/toilet/has_arm_rests', ['left_and_right', 'right', 'left']),
    'properties.accessibility.restrooms.0.toilet.foldingHandles':
      parseIsAnyOfEntry(data, 'inside/toilet/has_arm_rests', ['left_and_right', 'right', 'left']),
    'properties.accessibility.restrooms.0.toilet.foldingHandles.onUsersLeftSide':
      parseIsAnyOf(data, 'inside/toilet/has_arm_rests', ['left_and_right', 'left']),
    'properties.accessibility.restrooms.0.toilet.foldingHandles.onUsersRightSide':
      parseIsAnyOf(data, 'inside/toilet/has_arm_rests', ['left_and_right', 'right']),
    // washBasin
    'properties.accessibility.restrooms.0.washBasin':
      parseHasEntry(data, 'inside/toilet/has_basin'),
    'properties.accessibility.restrooms.0.washBasin.accessibleWithWheelchair':
      parseYesNo(data, 'inside/toilet/basin_wheelchair_reachable'),
    'properties.accessibility.restrooms.0.washBasin.spaceBelow':
      parseHasWithDefault(data,
                          'inside/toilet/basin_wheelchair_fits_belows',
                          wheelChairWashBasin,
                          null),
    // animal policy
    'properties.accessibility.animalPolicy.allowsAnyAnimals':
      parseYesNo(data, 'inquire/are_service_animals_allowed'),
    // staff
    'properties.accessibility.staff.isTrainedForDisabilities':
      parseYesNo(data, 'inquire/staff_has_disabled_training'),
    'properties.accessibility.staff.spokenLanguages':
      parseMultiSelect(data, 'inquire/staff_spoken_sign_langs'),
    'properties.accessibility.staff.isTrainedInSigning':
      parseYesNo(data, 'inquire/staff_can_speak_sign_lang'),
    // media
    'properties.accessibility.media.isLargePrint':
      parseYesNo(data, 'inquire/media/has_large_print'),
    'properties.accessibility.media.isAudio':
      parseYesNo(data, 'inquire/media/has_audio'),
    'properties.accessibility.media.isBraille':
      parseYesNo(data, 'inquire/media/has_braille'),
  };

  const result = {};
  // if there is a null in the history, do not set a value
  const customizedSetter = (currValue: any) => currValue === null ? null : undefined;
  for (const [key, value] of entries(mapping)) {
    if (typeof value !== 'undefined') {
      setWith(result, key, value, customizedSetter);
    }
  }

  // rate place a11y
  const a11y = evaluateWheelmapA11y(result);

  // TODO these fields don't exist in ac format! Clarify & align with wheelmap frontend & ac-format
  if (a11y === 'yes') {
    set(result, 'properties.accessibility.accessibleWith.wheelchair', true);
    set(result, 'properties.accessibility.partiallyAccessibleWith.wheelchair', true);
  } else if (a11y === 'partial') {
    set(result, 'properties.accessibility.accessibleWith.wheelchair', false);
    set(result, 'properties.accessibility.partiallyAccessibleWith.wheelchair', true);
  } else if (a11y === 'no') {
    set(result, 'properties.accessibility.accessibleWith.wheelchair', false);
    set(result, 'properties.accessibility.partiallyAccessibleWith.wheelchair', false);
  }

  // rate place a11y
  const toiletA11y = evaluateToiletWheelmapA11y(result);

  // rate toilet a11y
  // TODO this field doesn't exist in ac format! Clarify & align with wheelmap frontend & ac-format
  if (toiletA11y === 'yes') {
    setWith(result,
            'properties.accessibility.restrooms.0.isAccessibleWithWheelchair',
            true,
            customizedSetter);
  } else if (toiletA11y === 'no') {
    setWith(result,
            'properties.accessibility.restrooms.0.isAccessibleWithWheelchair',
            false,
            customizedSetter);
  }

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
    if (this.source) {
      if (this.lengthListener) {
        this.source.removeListener('length', this.lengthListener);
      }
      delete this.source;
    }
  }

  static getParameterSchema() {
    return new SimpleSchema({});
  }
}
