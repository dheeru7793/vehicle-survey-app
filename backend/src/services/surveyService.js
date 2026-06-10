'use strict';

const surveyRepository = require('../repositories/surveyRepository');
const { normalizeVehicleNumber, isValidVehicleNumber } = require('../utils/vehicleNumber');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/errors');
const Survey = require('../models/Survey');

const ROLES = require('../models/User').ROLES;

const RECENT_WINDOW_DAYS = 30;

function buildLocation({ latitude, longitude }) {
  if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
    return undefined;
  }
  return { type: 'Point', coordinates: [Number(longitude), Number(latitude)] };
}

async function createSurvey({ user, payload }) {
  const vehicleNumber = normalizeVehicleNumber(payload.vehicleNumber);
  if (!isValidVehicleNumber(vehicleNumber)) {
    throw new BadRequestError('Invalid vehicle number after normalization');
  }

  if (payload.clientId) {
    const existing = await surveyRepository.findByClientId(user._id, payload.clientId);
    if (existing) return existing;
  }

  const doc = {
    vehicleNumber,
    surveyorId: user._id,
    surveyorName: user.name,
    notes: payload.notes || '',
    location: buildLocation(payload),
    status: payload.status || Survey.STATUS.PENDING,
    clientId: payload.clientId || undefined,
    syncedAt: payload.status === Survey.STATUS.SYNCED ? new Date() : null,
  };
  return surveyRepository.create(doc);
}

async function updateSurvey({ user, id, payload }) {
  const survey = await surveyRepository.findById(id);
  if (!survey) throw new NotFoundError('Survey not found');
  if (user.role !== ROLES.ADMIN && String(survey.surveyorId) !== String(user._id)) {
    throw new ForbiddenError('Cannot update another surveyor\'s survey');
  }

  const update = {};
  if (payload.notes !== undefined) update.notes = payload.notes;
  if (payload.vehicleNumber !== undefined) {
    const vn = normalizeVehicleNumber(payload.vehicleNumber);
    if (!isValidVehicleNumber(vn)) throw new BadRequestError('Invalid vehicle number');
    update.vehicleNumber = vn;
  }
  if (payload.latitude !== undefined && payload.longitude !== undefined) {
    update.location = buildLocation(payload);
  }
  if (payload.status !== undefined) {
    update.status = payload.status;
    if (payload.status === Survey.STATUS.SYNCED) update.syncedAt = new Date();
  }
  return surveyRepository.updateById(id, update);
}

async function listSurveys({ user, query }) {
  const filter = {};
  if (user.role !== ROLES.ADMIN) {
    filter.surveyorId = user._id;
  } else if (query.surveyorId) {
    filter.surveyorId = query.surveyorId;
  }
  if (query.vehicleNumber) {
    const vn = normalizeVehicleNumber(query.vehicleNumber);
    filter.vehicleNumber = new RegExp('^' + vn);
  }
  if (query.status) filter.status = query.status;
  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from) filter.createdAt.$gte = new Date(query.from);
    if (query.to) filter.createdAt.$lte = new Date(query.to);
  }
  return filter;
}

async function getSurvey({ user, id }) {
  const survey = await surveyRepository.findById(id);
  if (!survey) throw new NotFoundError('Survey not found');
  if (user.role !== ROLES.ADMIN && String(survey.surveyorId) !== String(user._id)) {
    throw new ForbiddenError('Cannot view another surveyor\'s survey');
  }
  return survey;
}

async function duplicateCheck({ vehicleNumberRaw }) {
  const vehicleNumber = normalizeVehicleNumber(vehicleNumberRaw);
  if (!isValidVehicleNumber(vehicleNumber)) throw new BadRequestError('Invalid vehicle number');
  const since = new Date(Date.now() - RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const found = await surveyRepository.recentByVehicle(vehicleNumber, since);
  return {
    vehicleNumber,
    duplicate: Boolean(found),
    survey: found || null,
    windowDays: RECENT_WINDOW_DAYS,
  };
}

module.exports = {
  createSurvey,
  updateSurvey,
  listSurveys,
  getSurvey,
  duplicateCheck,
  RECENT_WINDOW_DAYS,
};
