'use strict';

const {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const { s3Client, bucket } = require('../config/s3');
const env = require('../config/env');

function buildPhotoKey({ vehicleNumber, sequenceNo, ext = 'jpg' }) {
  const date = new Date();
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const seq = String(sequenceNo).padStart(3, '0');
  return `vehicle-surveys/${vehicleNumber}/${yyyy}-${mm}-${dd}_${seq}.${ext}`;
}

function buildThumbKey(fullKey) {
  return fullKey.replace(/(\.[a-zA-Z0-9]+)$/, '_thumb$1');
}

async function uploadObject({ key, body, contentType = 'image/jpeg', cacheControl = 'private, max-age=31536000' }) {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: cacheControl,
    }),
  );
  return { key };
}

async function deleteObject(key) {
  await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

async function objectExists(key) {
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (_e) {
    return false;
  }
}

async function getObjectStream(key) {
  const out = await s3Client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  return out.Body;
}

async function getSignedDownloadUrl(key, expiresInSeconds = env.aws.signedUrlExpiresSeconds) {
  if (!key) return '';
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3Client, cmd, { expiresIn: expiresInSeconds });
}

module.exports = {
  buildPhotoKey,
  buildThumbKey,
  uploadObject,
  deleteObject,
  objectExists,
  getObjectStream,
  getSignedDownloadUrl,
  bucket,
};
