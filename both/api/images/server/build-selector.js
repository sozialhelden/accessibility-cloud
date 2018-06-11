
import { Images } from '../images';
import placeIdFilterSelector from './place-id-filter';

Images.apiParameterizedSelector = (visibleContentSelector, req) =>
  ({
    $and: [
      placeIdFilterSelector(req),
    ].filter(s => Object.keys(s).length > 0),
  });
