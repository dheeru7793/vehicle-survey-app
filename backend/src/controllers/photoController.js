'use strict';

const asyncHandler = require('../utils/asyncHandler');
const photoService = require('../services/photoService');
const zipService = require('../services/zipService');
const surveyRepository = require('../repositories/surveyRepository');
const surveyPhotoRepository = require('../repositories/surveyPhotoRepository');
const auditService = require('../services/auditService');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
const ROLES = require('../models/User').ROLES;

const upload = asyncHandler(async (req, res) => {
  const photos = await photoService.uploadPhotos({
    user: req.user,
    surveyId: req.params.id,
    files: req.files,
  });
  await auditService.logFromRequest(req, {
    action: auditService.ACTIONS.PHOTO_UPLOADED,
    entityType: 'Survey',
    entityId: req.params.id,
    metadata: { count: photos.length },
  });
  res.status(201).json({ photos });
});

const listForSurvey = asyncHandler(async (req, res) => {
  const photos = await photoService.listPhotosWithUrls({
    user: req.user,
    surveyId: req.params.id,
  });
  res.json({ items: photos });
});

const remove = asyncHandler(async (req, res) => {
  await photoService.deletePhoto({ user: req.user, photoId: req.params.photoId });
  await auditService.logFromRequest(req, {
    action: auditService.ACTIONS.PHOTO_DELETED,
    entityType: 'SurveyPhoto',
    entityId: req.params.photoId,
  });
  res.json({ ok: true });
});

const downloadZip = asyncHandler(async (req, res) => {
  const survey = await surveyRepository.findById(req.params.id);
  if (!survey) throw new NotFoundError('Survey not found');
  if (req.user.role !== ROLES.ADMIN && String(survey.surveyorId) !== String(req.user._id)) {
    throw new ForbiddenError();
  }
  const photos = await surveyPhotoRepository.listBySurvey(req.params.id);
  await zipService.streamSurveyZip({ res, survey, photos });
});

module.exports = { upload, listForSurvey, remove, downloadZip };
