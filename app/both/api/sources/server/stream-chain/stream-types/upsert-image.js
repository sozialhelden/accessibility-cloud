import mime from 'mime-types';
import { Random } from 'meteor/random';
import { Images } from '/both/api/images/images';
import Upsert from './upsert';
import { PlaceInfos } from '../../../../place-infos/place-infos';

export default class UpsertImage extends Upsert {
  constructor(options) {
    super(options);
    this.stream.unitName = 'images';
  }

  // eslint-disable-next-line class-methods-use-this
  setOnInsert(doc /* , { organizationSourceIds, organizationName } */) {
    const suffix = mime.extension(doc.mimeType);
    return {
      hashedIp: 'ACIMPORT',
      appToken: 'ACIMPORT',
      timestamp: new Date(),
      dimensions: { width: 1, height: 1 },
      isUploadedToS3: false,
      remotePath: `${doc.context}/${doc.objectId}/${Random.secret()}${suffix ? `.${suffix}` : ''}`,
    };
  }

  postProcessBeforeUpserting(doc, { organizationSourceIds, organizationName }) {
    const result = super.postProcessBeforeUpserting(doc, {
      organizationSourceIds,
      organizationName,
    });

    result.moderationRequired = result.moderationRequired || false;

    if (result.objectOriginalId) {
      const collection = {
        place: PlaceInfos,
      }[result.context];
      const objectSelector = {
        'properties.sourceId': result.objectSourceId || this.options.sourceId,
        'properties.originalId': result.objectOriginalId,
      };
      const object = collection.findOne(
        objectSelector,
        { transform: null, fields: { _id: 1 } },
      );
      result.objectId = object._id;
      if (!object._id) {
        console.log(`Warning: Could not find associated ${result.context} for`, result, 'with selector', objectSelector);
      }
    }

    return result;
  }
}

UpsertImage.collection = Images;

UpsertImage.originalIdPath = 'originalId';
UpsertImage.sourceImportIdPath = 'sourceImportId';
UpsertImage.sourceIdPath = 'sourceId';
UpsertImage.sourceNamePath = 'sourceName';
UpsertImage.organizationNamePath = 'organizationName';
