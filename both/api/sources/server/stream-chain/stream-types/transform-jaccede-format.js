const { Transform } = Npm.require('zstreams');
import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';

function isPureObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
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

  if (_.isArray(criteria.children)) {
    criteria.children.forEach((value) =>
      rollOutCriteriaBlock(result, `${path}/${criteria.label}`, value)
    );
  }

  result[criteria.criterion_id] = {
    name: `${path}/${criteria.label}`,
    value: (criteria.value || true),
  };
}

function convertPlaceDetails(data) {
  const obj = JSON.parse(data);
  if (obj.accessibility) {
    const accessibilityFlattened = {};
    obj.accessibility.forEach(c => rollOutCriteriaBlock(accessibilityFlattened, '', c));
    obj.accessibilityFlattened = accessibilityFlattened;
  }
  return obj;
}

export class TransformJaccedeFormat {
  constructor({ onDebugInfo }) {

    check(onDebugInfo, Function);
    this.stream = new Transform({
      writableObjectMode: true,
      readableObjectMode: true,
      transform(input, encoding, callback) {
        const output = convertPlaceDetails(input);
        callback(null, output);
      },
    });
  }

  static getParameterSchema() {
    return new SimpleSchema({

    });
  }
}
