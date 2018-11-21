// Disabled for now for better performance

// import { Meteor } from 'meteor/meteor';
// import { Random } from 'meteor/random';
// import { EquipmentInfos } from '../equipment-infos';

// Meteor.startup(() => {
//   EquipmentInfos.find({
//     statusReportToken: { $exists: false },
//   }).observeChanges({
//     added(id) {
//       console.log('Add secret status report token to equipment info', id);
//       EquipmentInfos.update(id, { $set: { statusReportToken: Random.secret(19) } });
//     },
//   });
// });
