import { Template } from 'meteor/templating';
import './recursive-attributes.html';
import { _ } from 'lodash';

const histogramAttributesMatchers = [
  /^rating/i,
  /height$/i,
  /width$/i,
  /count$/i
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
  needsHistogram() {
    const lastPathSegment = this.attributeName.match(/[^\.]+$/)[0];
    return histogramAttributesMatchers.find(m => lastPathSegment.match(m));
  },
  isBoolean() {
    const keys = Object.keys(this.properties)
    if (keys.filter(k => !['undefined', 'true', 'false'].includes(k)).length) {
      return false;
    }
    return _.has(this.properties, 'false') || _.has(this.properties, 'true');
  },
  joinPath(attributeName, key) {
    return attributeName ? `${attributeName}.${key}` : key;
  },
});
