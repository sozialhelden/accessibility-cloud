import { Sources } from '/both/api/sources/sources';
import { PlaceInfos } from '/both/api/place-infos/place-infos';
import wrapCollectionAPIResponseAsGeoJSON from '../../shared/server/wrapCollectionAPIResponseAsGeoJSON';


PlaceInfos.wrapCollectionAPIResponse = wrapCollectionAPIResponseAsGeoJSON;
PlaceInfos.includePathsByDefault = ['source.license'];
