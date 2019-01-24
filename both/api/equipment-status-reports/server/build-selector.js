import { EquipmentStatusReports } from '../equipment-status-reports';

import sourceFilterSelector from '../../shared/server/source-filter';

EquipmentStatusReports.apiParameterizedSelector = ({ visibleContentSelector, req }) =>
  ({
    $and: [
      sourceFilterSelector(req),
      visibleContentSelector,
    ].filter(s => Object.keys(s).length > 0),
  });
