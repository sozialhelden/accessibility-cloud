// import { PlaceInfoSchema } from '@sozialhelden/a11yjson';
// import { Meteor } from 'meteor/meteor';
// import { check } from 'meteor/check';
// import { SimpleSchema } from 'meteor/aldeed:simple-schema';


// const { Transform } = Npm.require('zstreams');

// export default class ValidatePlace {
//   constructor(options) {
//     const {
//       sourceId,
//       sourceImportId,
//       onDebugInfo,
//       ignoreInvalidRecords = true,
//     } = options;

//     check(sourceId, String);
//     check(sourceImportId, String);
//     check(onDebugInfo, Function);

//     this.options = options;

//     let invalidDocumentCount = 0;
//     let firstInvalidDocument = null;

//     this.stream = new Transform({
//       writableObjectMode: true,
//       readableObjectMode: true,
//       highWaterMark: 3,
//       transform(nonCleanDoc, encoding, callback) {
//         const validationContext = PlaceInfoSchema.newContext();
//         const doc = PlaceInfoSchema.clean(nonCleanDoc);
//         validationContext.validate(doc);

//         if (!validationContext.isValid()) {
//           const errors = validationContext.validationErrors();
//           invalidDocumentCount += 1;
//           if (!firstInvalidDocument) {
//             firstInvalidDocument = doc;
//             onDebugInfo({ firstInvalidDocument: doc, firstValidationErrors: errors });
//           }
//           if (!ignoreInvalidRecords) {
//             this.emit('error', errors);
//             callback(errors);
//           }
//           return;
//         }

//         Object.assign(doc.properties, {
//           sourceId,
//           sourceImportId,
//         });

//         callback(null, doc);
//       },
//     });

//     this.endListener = () => {
//       onDebugInfo({ invalidDocumentCount });
//     };
//     this.stream.on('end', this.endListener);

//     this.lengthListener = length => this.stream.emit('length', length);
//     this.pipeListener = (source) => {
//       this.source = source;
//       source.on('length', this.lengthListener);
//     };
//     this.stream.on('pipe', this.pipeListener);

//     this.stream.unitName = 'place infos';
//   }

//   dispose() {
//     this.stream.removeListener('end', this.endListener);
//     delete this.endListener;
//     this.stream.removeListener('pipe', this.pipeListener);
//     delete this.pipeListener;
//     if (this.source) this.source.removeListener('length', this.lengthListener);
//     delete this.source;
//     delete this.lengthListener;
//     delete this.stream;
//   }

//   static getParameterSchema() {
//     return new SimpleSchema({

//     });
//   }
// }
