import { Meteor } from 'meteor/meteor';
import { setupHTTPAuthentication } from '/imports/startup/server/http-basic-auth';
// import { AutoForm } from 'meteor/aldeed:autoform';

// Meteor.startup(setupHTTPAuthentication);

BrowserPolicy.content.allowOriginForAll('api.mapbox.com');
BrowserPolicy.content.allowOriginForAll('npmcdn.com');


// AutoForm.addInputType('tos-checkbox', {
//   template: 'afTosCheckbox',
//   valueOut() {
//     return !!this.is(':checked');
//   },
//   valueConverters: {
//     string: AutoForm.valueConverters.booleanToString,
//     stringArray: AutoForm.valueConverters.booleanToStringArray,
//     number: AutoForm.valueConverters.booleanToNumber,
//     numberArray: AutoForm.valueConverters.booleanToNumberArray,
//   },
//   contextAdjust(context) {
//     if (context.value === true) {
//       context.atts.checked = '';
//     }
//     // Don't add required attribute to checkboxes because some browsers assume
//     // that to mean that it must be checked, which is not what we mean by "required"
//     delete context.atts.required;
//     return context;
//   },
// });
