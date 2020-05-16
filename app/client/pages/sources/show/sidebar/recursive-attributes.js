import { Template } from 'meteor/templating';
import './recursive-attributes.html';
import { _ } from 'lodash';

const histogramAttributesMatchers = [
  /^rating/i,
  /^numberOf/i,
  /height$/i,
  /width$/i,
  /length$/i,
  /count$/i,
  /angle$/i,
  /^distanceTo/i,
  /value$/i,
  /unit$/i,
];

Template.sources_show_page_recursive_attributes.helpers({
  attributeIsHidden(attributeName) {
    return attributeName.match(/category$/i) || attributeName.match(/description$/i) || attributeName.match(/sourceImportId$/);
  },
  keys() {
    return Object.keys(this.properties);
  },
  isArray() {
    return _.isArray(this.properties);
  },
  isObject() {
    return _.isObject(this.properties);
  },
  needsHistogram() {
    if (this.properties && this.properties.value) return false;
    const matchedSegment = this.attributeName.match(/[^.]+$/);
    if (!matchedSegment) {
      return false;
    }
    const lastPathSegment = matchedSegment[0];
    return histogramAttributesMatchers.find(m => lastPathSegment.match(m)) || this.attributeName.match(/debug\./);
  },
  isBoolean() {
    const keys = Object.keys(this.properties);
    if (keys.filter(k => !['undefined', 'true', 'false', '0', '1'].includes(k)).length) {
      return false;
    }
    return _.has(this.properties, 'false') || _.has(this.properties, 'true') || _.has(this.properties, '1') || _.has(this.properties, '0');
  },
  joinPath(attributeName, key) {
    return attributeName ? `${attributeName}.${key}` : key;
  },
});
