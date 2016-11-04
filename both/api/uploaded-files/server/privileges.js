import { UploadedFiles } from '../uploaded-files';

// Deny all client-side updates since we will be using methods to manage this collection
UploadedFiles.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
