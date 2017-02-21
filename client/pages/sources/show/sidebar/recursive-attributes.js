import { Template } from 'meteor/templating';
import './recursive-attributes.html';
import { _ } from 'lodash';


Template.sources_show_page_recursive_attributes.helpers({
  attributeIsHidden(attributeName) {
    return attributeName.match(/category$/) || attributeName.match(/sourceImportId$/);
  },
  keys() {
    return Object.keys(this.properties);
  },
  isArray() {
    return _.isArray(this.properties);
  },
  isRating() {
    const lastPathSegment = this.attributeName.match(/[^\.]+$/)[0];
    return !!lastPathSegment.match(/rating/i);
  },
  isBoolean() {
    return _.has(this.properties, 'false') || _.has(this.properties, 'true');
  },
  joinPath(attributeName, key) {
    return attributeName ? `${attributeName}.${key}` : key;
  },
});
