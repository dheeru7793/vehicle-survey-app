'use strict';

const multer = require('multer');
const env = require('../config/env');

const ALLOWED_MIME = new Set(['image/jpeg', 'image/jpg', 'image/png']);

const storage = multer.memoryStorage();

function fileFilter(_req, file, cb) {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    return cb(new Error(`Unsupported mime type: ${file.mimetype}`));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.uploads.maxPhotoBytes,
    files: env.uploads.maxPhotosPerRequest,
  },
});

const uploadMw = upload.array('photos', env.uploads.maxPhotosPerRequest);

module.exports = { upload, uploadMw, ALLOWED_MIME };
