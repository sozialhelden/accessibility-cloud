import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const locationSchema = new SimpleSchema({
  geometry: {
    type: {},
    optional: true,
  },
  'geometry.type': {
    type: String,
    allowedValues: ['Point'],
  },
  'geometry.coordinates': {
    type: Array,
    minCount: 2,
    maxCount: 2
  },
  'geometry.coordinates.$': {
    type: Number,
    min: -180,
    max: 180,
    decimal: true,
  },
  'coordinates.$': {
    type: Number,
    decimal: true,
    custom() {
      if (Math.abs(this.value[0]) > 90) return 'outOfRange';
      if (Math.abs(this.value[1]) > 180) return 'outOfRange';
      return undefined;
    },
  },
});

export default locationSchema;
