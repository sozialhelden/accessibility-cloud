import { Sources } from '../../sources/sources';
import { Disruptions } from '../../disruptions/disruptions';
import convertToGeoJSONFeature from '../../shared/convertToGeoJSONFeature';
import wrapAPIResponseAsGeoJSON from '../../shared/server/wrapAPIResponseAsGeoJSON';

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
