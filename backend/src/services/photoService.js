'use strict';

const sharp = require('sharp');

const s3Service = require('./s3Service');
const surveyRepository = require('../repositories/surveyRepository');
const surveyPhotoRepository = require('../repositories/surveyPhotoRepository');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/errors');
const ROLES = require('../models/User').ROLES;

const FULL_MAX_WIDTH = 1920;
const FULL_JPEG_QUALITY = 78;
const THUMB_MAX_WIDTH = 320;
const THUMB_JPEG_QUALITY = 70;

async function recompressFull(buffer) {
  return sharp(buffer)
    .rotate()
    .resize({ width: FULL_MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: FULL_JPEG_QUALITY, mozjpeg: true })
    .toBuffer();
}

async function recompressThumb(buffer) {
  return sharp(buffer)
    .rotate()
    .resize({ width: THUMB_MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: THUMB_JPEG_QUALITY, mozjpeg: true })
    .toBuffer();
}

async function ensureCanAccessSurvey(user, survey) {
  if (!survey) throw new NotFoundError('Survey not found');
  if (user.role !== ROLES.ADMIN && String(survey.surveyorId) !== String(user._id)) {
    throw new ForbiddenError('Cannot modify another surveyor\'s survey');
  }
}

async function uploadPhotos({ user, surveyId, files }) {
  if (!files || files.length === 0) throw new BadRequestError('No files provided (field: photos)');
  const survey = await surveyRepository.findById(surveyId);
  await ensureCanAccessSurvey(user, survey);

  let nextSeq = (await surveyPhotoRepository.maxSequenceNo(surveyId)) + 1;
  const created = [];

  for (const file of files) {
    const fullBuffer = await recompressFull(file.buffer);
    const thumbBuffer = await recompressThumb(file.buffer);
    const fullKey = s3Service.buildPhotoKey({
      vehicleNumber: survey.vehicleNumber,
      sequenceNo: nextSeq,
    });
    const thumbKey = s3Service.buildThumbKey(fullKey);

    await s3Service.uploadObject({ key: fullKey, body: fullBuffer, contentType: 'image/jpeg' });
    await s3Service.uploadObject({ key: thumbKey, body: thumbBuffer, contentType: 'image/jpeg' });

    const photo = await surveyPhotoRepository.create({
      surveyId,
      vehicleNumber: survey.vehicleNumber,
      s3Key: fullKey,
      s3ThumbKey: thumbKey,
      sequenceNo: nextSeq,
      sizeBytes: fullBuffer.length,
      mimeType: 'image/jpeg',
    });
    await surveyRepository.incrementPhotoCount(surveyId, 1);
    created.push(photo);
    nextSeq += 1;
  }

  return created;
}

async function listPhotosWithUrls({ user, surveyId }) {
  const survey = await surveyRepository.findById(surveyId);
  await ensureCanAccessSurvey(user, survey);
  const photos = await surveyPhotoRepository.listBySurvey(surveyId);
  return Promise.all(
    photos.map(async (p) => {
      const [url, thumbUrl] = await Promise.all([
        s3Service.getSignedDownloadUrl(p.s3Key),
        p.s3ThumbKey ? s3Service.getSignedDownloadUrl(p.s3ThumbKey) : Promise.resolve(''),
      ]);
      return { ...p.toObject(), url, thumbUrl };
    }),
  );
}

async function deletePhoto({ user, photoId }) {
  const photo = await surveyPhotoRepository.findById(photoId);
  if (!photo) throw new NotFoundError('Photo not found');
  const survey = await surveyRepository.findById(photo.surveyId);
  await ensureCanAccessSurvey(user, survey);

  await Promise.allSettled([
    s3Service.deleteObject(photo.s3Key),
    photo.s3ThumbKey ? s3Service.deleteObject(photo.s3ThumbKey) : Promise.resolve(),
  ]);
  await surveyPhotoRepository.deleteById(photoId);
  await surveyRepository.incrementPhotoCount(photo.surveyId, -1);
  return { ok: true };
}

module.exports = {
  uploadPhotos,
  listPhotosWithUrls,
  deletePhoto,
};
