
import { Images } from '../images';
import objectIdFilterSelector from './object-id-filter';

Images.apiParameterizedSelector = ({ req }) =>
  ({
    $and: [
      objectIdFilterSelector(req),
    ].filter(s => Object.keys(s).length > 0),
  });
