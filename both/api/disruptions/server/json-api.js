import { Sources } from '../../sources/sources';
import { Disruptions } from '../../disruptions/disruptions';
import {
  convertToGeoJSONFeature,
  wrapAPIResponseAsGeoJSON,
} from '../../shared/server/geo-json-conversion';

Disruptions.convertToGeoJSONFeature = convertToGeoJSONFeature;
Disruptions.wrapAPIResponse = wrapAPIResponseAsGeoJSON;

Disruptions.relationships = {
  belongsTo: {
    source: {
      foreignCollection: Sources,
      foreignKey: 'properties.sourceId',
    },
  },
};

Disruptions.includePathsByDefault = ['source.license'];
