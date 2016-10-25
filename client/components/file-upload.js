import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { check } from 'meteor/check';
import { ReactiveVar } from 'meteor/reactive-var';

function uploadFile({ file, metadata = {}, onUploaded, onProgress, onError }) {
  check(file, File);
  check(onUploaded, Function);
  check(onProgress, Function);
  check(onError, Function);
  check(metadata, Object);

  console.log('Uploading', file, 'with metadata', metadata);

  const xhr = new XMLHttpRequest();
  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const percentage = Math.round((e.loaded * 100) / e.total);
      onProgress(percentage);
    }
  }, false);
  xhr.onerror = (error) => {
    console.log('Error while uploading file:', error);
    onError(error);
  };
  xhr.onload = () => {
    try {
      const response = JSON.parse(xhr.response);
      if (response.error) {
        onError(response.error);
        return;
      }
      console.log('File succesfully uploaded:', response);
      onUploaded(response, xhr);
    } catch (error) {
      onError(error);
    }
    if (xhr.status > 400) {
      onError(new Error(`Got error ${xhr.status} (${xhr.statusText}) on upload.`));
    }
  };

  Meteor.call('getFileUploadToken', (error, token) => {
    if (error) {
      onError(new Error('Could not get file upload token:', error.reason));
      return;
    }
    Object.assign(metadata, {
      token,
      mimeType: file.type,
      originalFileName: file.name,
    });
    const queryString = Object.keys(metadata).map(k => `${k}=${metadata[k]}`).join('&');
    xhr.open('POST', `/file-upload?${queryString}`);
    // xhr.overrideMimeType('text/plain; charset=x-user-defined-binary');
    const reader = new FileReader();
    reader.onload = event => xhr.send(event.target.result);
    reader.readAsArrayBuffer(file);
  });

  return xhr;
}

Template.fileUpload.helpers({
  percentage() {
    return Template.instance().percentage.get();
  },
  isComplete() {
    return Template.instance().percentage.get() === 100;
  },
});

Template.fileUpload.events({
  'change input[type="file"]'(event, instance) {
    const callback = (name, ...args) => {
      if (instance.data.callbacks && instance.data.callbacks[name]) {
        instance.data.callbacks[name].apply(instance.data, args);
      }
    };

    if (event.target.files.length > 1) {
      callback('onError', new Error('Currently, only one file upload at once is supported.'));
      return;
    }

    const file = event.target.files[0];
    if (!file) return;
    const metadata = instance.data.metadata || {};
    const xhr = uploadFile({
      file,
      metadata,
      onUploaded(response) {
        console.log('File uploaded', file);
        instance.percentage.set(100);
        callback('onUploaded', response, xhr);
      },
      onProgress(percentage) {
        console.log('Upload progress:', percentage, '%');
        instance.percentage.set(percentage);
        callback('onProgress', percentage, xhr);
      },
      onError(error) {
        alert('Could not upload file:', error.reason);
        callback('onError', error, xhr);
      },
    });

    if (instance.data.accept && !file.type.match(instance.data.accept)) {
      alert(`Only ${instance.data.accept} files are allowed.`);
      return;
    }
  },
});

Template.fileUpload.onCreated(function created() {
  this.percentage = new ReactiveVar(null);
});
