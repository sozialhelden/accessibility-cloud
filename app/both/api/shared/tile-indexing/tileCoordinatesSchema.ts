import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const xyIndexSchema = new SimpleSchema({
  x: {
    type: Number,
    min: 0,
  },
  y: {
    type: Number,
    min: 0,
  },
});

const zSchemaDefinition: { [z: number]: { x: number, y: number }} = {};

Array.from({ length: 23 }).forEach((_, z) => {
  zSchemaDefinition[z] = xyIndexSchema;
});

const tileCoordinatesSchema = new SimpleSchema({
  tileCoordinates: {
    optional: true,
    blackbox: true,
    defaultValue: {},
    type: zSchemaDefinition,
  },
});

export default tileCoordinatesSchema;
