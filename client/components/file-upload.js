import { Template } from 'meteor/templating';
import { check } from 'meteor/check';
import { ReactiveVar } from 'meteor/reactive-var';

function uploadFile({ file, onUploaded, onProgress }) {
  check(file, File);
  check(onUploaded, Function);
  check(onProgress, Function);

  const xhr = new XMLHttpRequest();
  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const percentage = Math.round((e.loaded * 100) / e.total);
      onProgress(percentage);
    }
  }, false);
  xhr.upload.addEventListener('load', onUploaded, false);
  xhr.onerror = (error) => {
    console.log('Error while uploading file:', error);
  };
  xhr.onload = () => {
    debugger
  };
  xhr.open('POST', '/file-upload');
  // xhr.overrideMimeType('text/plain; charset=x-user-defined-binary');

  const reader = new FileReader();
  reader.onload = event => xhr.send(event.target.result);
  reader.readAsArrayBuffer(file);
}

Template.fileUpload.helpers({
  percentage() {
    return Template.instance().percentage.get();
  },
});

Template.fileUpload.events({
  'change input[type="file"]'(event, instance) {
    if (event.target.files.length > 1) {
      alert('Currently, only one file upload at once is supported.');
      return;
    }

    const file = event.target.files[0];
    if (!file) return;

    uploadFile({
      file,
      onUploaded() {
        console.log('File uploaded', file);
        instance.percentage.set(100);
      },
      onProgress(percentage) {
        console.log('Upload progress:', percentage, '%');
        instance.percentage.set(percentage);
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
