import { GlobalStats } from '../global-stats';
import nameSelector from './name-selector';

GlobalStats.apiParameterizedSelector = ({ req }) =>
({
  $and: [
    nameSelector(req),
  ].filter(s => Object.keys(s).length > 0),
});
