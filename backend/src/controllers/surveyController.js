'use strict';

const asyncHandler = require('../utils/asyncHandler');
const surveyService = require('../services/surveyService');
const surveyRepository = require('../repositories/surveyRepository');
const auditService = require('../services/auditService');
const { parsePagination, buildPageMeta } = require('../utils/pagination');

const create = asyncHandler(async (req, res) => {
  const survey = await surveyService.createSurvey({ user: req.user, payload: req.body });
  await auditService.logFromRequest(req, {
    action: auditService.ACTIONS.SURVEY_CREATED,
    entityType: 'Survey',
    entityId: survey._id,
    metadata: { vehicleNumber: survey.vehicleNumber, clientId: req.body.clientId || null },
  });
  res.status(201).json({ survey });
});

const update = asyncHandler(async (req, res) => {
  const survey = await surveyService.updateSurvey({
    user: req.user,
    id: req.params.id,
    payload: req.body,
  });
  await auditService.logFromRequest(req, {
    action: req.body.status === 'SYNCED'
      ? auditService.ACTIONS.SURVEY_SYNCED
      : auditService.ACTIONS.SURVEY_UPDATED,
    entityType: 'Survey',
    entityId: survey._id,
  });
  res.json({ survey });
});

const list = asyncHandler(async (req, res) => {
  const filter = await surveyService.listSurveys({ user: req.user, query: req.query });
  const { page, limit, skip } = parsePagination(req.query);
  const sortField = req.query.sort || 'createdAt';
  const sortDir = req.query.order === 'asc' ? 1 : -1;
  const [items, total] = await Promise.all([
    surveyRepository.list({ filter, skip, limit, sort: { [sortField]: sortDir } }),
    surveyRepository.count(filter),
  ]);
  res.json({ items, page: buildPageMeta({ page, limit, total }) });
});

const getById = asyncHandler(async (req, res) => {
  const survey = await surveyService.getSurvey({ user: req.user, id: req.params.id });
  res.json({ survey });
});

const duplicateCheck = asyncHandler(async (req, res) => {
  const result = await surveyService.duplicateCheck({ vehicleNumberRaw: req.query.vehicleNumber });
  res.json(result);
});

module.exports = { create, update, list, getById, duplicateCheck };
