// @flow

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { HTTP } from 'meteor/http';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { isPlainObject, get, set, isArray, fromPairs } from 'lodash';
import { Stream } from 'stream';
import StreamObserver from './stream-observer';

const { Transform } = Npm.require('zstreams');

function isPureObject(obj: ?any): boolean {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

async function getCategories(categoriesUrl, apiKey) {
  const options = {
    params: {
      lang: 'en',
    },
    headers: {
      Accept: 'application/json',
      'X-Api-Key': apiKey,
    },
  };

  return new Promise((resolve, reject) => {
    HTTP.get(categoriesUrl, options, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(fromPairs(response.data.items.map(item => [item.id, item.name])));
      }
    });
  });
}


/*
criteriaBlock: {
  label: String,
  criteria_id: Number,
  value: String,  // Optional
  children: Array // optional List of criteriaBlocks
}
*/

function rollOutCriteriaBlock(result, path, criteria) {
  // console.log(path.white);
  if (!isPureObject(criteria)) {
    throw new Meteor.Error(422, 'Invalid object for rollOutCriteriaBlock()');
  }

  if (isArray(criteria.children)) {
    criteria.children.forEach(value =>
    rollOutCriteriaBlock(result, `${path}/${criteria.label}`, value),
    );
  }

  result[criteria.criterion_id] = {
    name: `${path}/${criteria.label}`,
    value: (criteria.value || true),
    valueId: criteria.value_id,
  };
}

function simplifyWheelchairAccessibility(flattenedAccessibility) {
  function valueId(criterionId: number): number {
    return parseInt(get(flattenedAccessibility, `${criterionId}.valueId`), 10);
  }

  function value(criterionId: number): ?string | number | boolean {
    return get(flattenedAccessibility, `${criterionId}.value`);
  }

  function removeNullAndUndefinedFields(something: ?any): ?any {
    const isDefined: boolean = x =>
      typeof x !== 'undefined' &&
      x !== null &&
      !(isArray(x) && x.length === 0) &&
      !(isPlainObject(x) && Object.keys(x).length === 0);
    if (isPlainObject(something)) {
      const result = {};
      Object.keys(something)
        .filter(key => isDefined(something[key]))
        .forEach((key) => {
          const value = removeNullAndUndefinedFields(something[key]);
          if (isDefined(value)) {
            result[key] = value;
          }
        });
      return Object.keys(result).length > 0 ? result : undefined;
    } else if (isArray(something)) {
      const result = something
        .filter(isDefined)
        .map(removeNullAndUndefinedFields);
      return result.length ? result : undefined; // filter out empty arrays
    }
    return something;
  }

  const indoorsWheelchairAccessibilityId = valueId(45);
  const hasTotalIndoorsWheelchairAccessibility = indoorsWheelchairAccessibilityId === 52;
  const hasPartialIndoorsWheelchairAccessibility = indoorsWheelchairAccessibilityId === 53;
  const entranceAccessId = valueId(3);
  const entranceIsLevel = entranceAccessId === 4;
  const hasEntranceSlope = value(7);
  const hasEntranceLift = value(9);
  const stepHeight = value(12);
  const stepHeightInCm = typeof stepHeight !== 'undefined' ? parseInt(stepHeight, 10) : undefined;

  const numberOfSteps = {
    16: 1,
    17: 2,
    18: 3,
    19: '>3',
  }[valueId(11)];

  const doorWidth = {
    33: '>90cm',
    34: (value(34) || '<90cm'),
  }[valueId(26)];

  const result = {
    areas: [
      {
        name: 'Entrance',
        entrances: [
          {
            isMainEntrance: value(21),
            isLevel: entranceAccessId ? entranceIsLevel : undefined,
            hasRemovableRamp: value(8),
            hasVisibleAndReadableSign: value(20),
            hasBrailleSitemap: value(50),
            hasSlope: hasEntranceSlope,
            intercom: {
              isAvailable: value(23),
              height: value(27) ? '90..120cm' : undefined,
              isColorContrastedWithWall: value(28),
            },
            stairs: {
              count: numberOfSteps,
              nosing: {
                isHighContrast: value(14),
                isAntiSlip: value(14),
              },
              stepHeight: stepHeightInCm && (0.01 * stepHeightInCm),
              hasHandRail: value(13),
              hasStairLift: hasEntranceLift,
              hasTactileSafetyStrip: value(15),
            },
            door: {
              width: doorWidth,
              isAutomaticOrAlwaysOpen: { 29: true, 30: false }[valueId(25)],
              hasClearMarkingOnGlassDoor: value(24),
              isEasyToHoldOpen: value(32),
              hasErgonomicDoorHandle: value(31),
            },
          },
        ],
      },
    ],
  };

  // This algorithm sets a general wheelchair accessibility attribute for a PoI from Jaccede.

  const canEnterWithoutAssistance = entranceIsLevel || hasEntranceSlope || hasEntranceLift;

  // If it's not clear whether you can use the indoor facilities with a wheelchair or enter,
  // accessibility is undefined.
  if (
    typeof indoorsWheelchairAccessibilityId === 'undefined' &&
    typeof entranceAccessId === 'undefined'
  ) {
    return result;
  }

  if (canEnterWithoutAssistance) {
    if (hasTotalIndoorsWheelchairAccessibility) {
      set(result, 'accessibleWith.wheelchair', true);
      set(result, 'partiallyAccessibleWith.wheelchair', true);
    }
    if (hasPartialIndoorsWheelchairAccessibility) {
      set(result, 'partiallyAccessibleWith.wheelchair', true);
    }
  } else if (
    entranceIsLevel === false &&
    numberOfSteps === 1 &&
    typeof stepHeightInCm !== 'undefined' &&
    stepHeightInCm <= 7
  ) {
    if (hasTotalIndoorsWheelchairAccessibility || hasPartialIndoorsWheelchairAccessibility) {
      set(result, 'partiallyAccessibleWith.wheelchair', true);
    }
  } else {
    set(result, 'partiallyAccessibleWith.wheelchair', false);
    set(result, 'accessibleWith.wheelchair', false);
  }

  return removeNullAndUndefinedFields(result);
}

function convertPlaceDetails(data, categoryIdsToNames) {
  const obj = JSON.parse(data);
  if (obj.accessibility) {
    const accessibilityFlattened = {};
    obj.accessibility.forEach(c => rollOutCriteriaBlock(accessibilityFlattened, '', c));
    obj.accessibilityFlattened = accessibilityFlattened;
    obj.jaccedeAccessibility = obj.accessibility;
    obj.accessibility = simplifyWheelchairAccessibility(accessibilityFlattened);
  }
  const categoryId = get(obj, 'category.id');
  obj.originalCategoryName = categoryIdsToNames[categoryId];
  // debugger
  return obj;
}

export class SimplifyJaccedeFormat extends StreamObserver {
  stream: Transform;
  source: Stream;
  lengthListener: (length: Number) => void;
  pipeListener: (source: Stream) => void;

  constructor({ onDebugInfo, apiKey, categoriesUrl }) {
    super({ onDebugInfo });
    check(onDebugInfo, Function);

    const categoriesPromise = getCategories(categoriesUrl, apiKey);

    this.stream = new Transform({
      writableObjectMode: true,
      readableObjectMode: true,
      transform(input, encoding, callback) {
        categoriesPromise.then((categories) => {
          const output = convertPlaceDetails(input, categories);
          output.originalData = JSON.parse(input);
          callback(null, output);
        },
        callback);
      },
    });

    this.lengthListener = length => this.stream.emit('length', length);
    this.pipeListener = (source) => {
      source.on('length', this.lengthListener);
      this.source = source;
    };

    this.stream.on('pipe', this.pipeListener);
  }

  dispose() {
    if (this.stream) {
      this.stream.removeListener('pipe', this.pipeListener);
      delete this.stream;
    }
    if (this.source) {
      this.source.removeListener('length', this.lengthListener);
      delete this.source;
    }
    delete this.lengthListener;
    delete this.pipeListener;
  }

  static getParameterSchema() {
    return new SimpleSchema({
      apiKey: { type: String },
      categoriesUrl: { type: String },
    });
  }
}
