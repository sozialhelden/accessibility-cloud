import SimpleSchema from "simpl-schema";

const UserAgentSchema = new SimpleSchema({
  'browser': {
    type: Object,
    optional: true,
  },
  'browser.name': {
    type: String,
    optional: true,
  },
  'browser.version': {
    type: String,
    optional: true,
  },
  'browser.major': {
    type: String,
    optional: true,
  },
  'cpu': {
    type: Object,
    optional: true,
  },
  'cpu.architecture': {
    type: String,
    optional: true,
  },
  'device': {
    type: Object,
    optional: true,
  },
  'device.model': {
    type: String,
    optional: true,
  },
  'device.type': {
    type: String,
    optional: true,
  },
  'device.vendor': {
    type: String,
    optional: true,
  },
  'engine': {
    type: Object,
    optional: true,
  },
  'engine.name': {
    type: String,
    optional: true,
  },
  'engine.version': {
    type: String,
    optional: true,
  },
  'os': {
    type: Object,
    optional: true,
  },
  'os.name': {
    type: String,
    optional: true,
  },
  'os.version': {
    type: String,
    optional: true,
  },
  'ua': {
    type: String,
    optional: true,
  },
});

export default UserAgentSchema;
