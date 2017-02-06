import { Bert } from 'meteor/themeteorchef:bert';
import { TAPi18n } from 'meteor/tap:i18n';

export const showNotification = ({ title, message }) => {
  Bert.alert({
    title,
    message,
    type: 'info',
    style: 'growl-top-right',
  });
};

export const showErrorNotification = ({ title = TAPi18n.__('An Error occurred'), error }) => {
  Bert.alert({
    title,
    message: error.message,
    type: 'danger',
    style: 'growl-top-right',
  });
};
