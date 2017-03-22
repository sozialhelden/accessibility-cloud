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

export class SimplifyJaccedeFormat {
  constructor({ onDebugInfo }) {
    check(onDebugInfo, Function);

    this.stream = new Transform({
      writableObjectMode: true,
      readableObjectMode: true,
      transform(input, encoding, callback) {
        const output = convertPlaceDetails(input);
        output.originalData = JSON.parse(input);
        callback(null, output);
      },
    });

    this.lengthListener = length => this.stream.emit('length', length);
    this.pipeListener = source => {
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

    });
  }
}
