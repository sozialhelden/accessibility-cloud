import { Sources } from '/both/api/sources/sources';
import { PlaceInfos } from '/both/api/place-infos/place-infos';
import wrapAPIResponseAsGeoJSON from '../../shared/server/wrapAPIResponseAsGeoJSON';


PlaceInfos.wrapAPIResponse = wrapAPIResponseAsGeoJSON;
PlaceInfos.includePathsByDefault = ['source.license'];
