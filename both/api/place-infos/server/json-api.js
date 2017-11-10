import { Sources } from '/both/api/sources/sources';
import { PlaceInfos } from '/both/api/place-infos/place-infos';
import wrapAPIResponseAsGeoJSON from '../../shared/server/wrapAPIResponseAsGeoJSON';


PlaceInfos.wrapAPIResponse = wrapAPIResponseAsGeoJSON;

PlaceInfos.relationships = {
  belongsTo: {
    source: {
      foreignCollection: Sources,
      foreignKey: 'properties.sourceId',
    },
  },
};

PlaceInfos.includePathsByDefault = ['source.license'];
