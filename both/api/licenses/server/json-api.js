import { omit } from 'lodash';

import { Licenses } from '../licenses';

Licenses.convertToJSON = doc => omit(doc, 'plainTextSummary');
