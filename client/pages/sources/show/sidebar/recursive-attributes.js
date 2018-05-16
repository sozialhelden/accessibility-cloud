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
  needsHistogram() {
    if (this.properties && this.properties.value) return false;
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
