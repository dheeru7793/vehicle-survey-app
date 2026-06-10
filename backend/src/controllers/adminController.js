'use strict';

const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/userService');
const userRepository = require('../repositories/userRepository');
const dashboardService = require('../services/dashboardService');
const auditService = require('../services/auditService');
const { NotFoundError } = require('../utils/errors');
const ROLES = require('../models/User').ROLES;
const { parsePagination, buildPageMeta } = require('../utils/pagination');

const createSurveyor = asyncHandler(async (req, res) => {
  const surveyor = await userService.createSurveyor(req.body);
  await auditService.logFromRequest(req, {
    action: auditService.ACTIONS.SURVEYOR_CREATED,
    entityType: 'User',
    entityId: surveyor._id,
    metadata: { employeeId: surveyor.employeeId },
  });
  res.status(201).json({ user: surveyor.toJSON() });
});

const listSurveyors = asyncHandler(async (req, res) => {
  const filter = { role: ROLES.SURVEYOR };
  if (req.query.q) {
    const q = String(req.query.q).trim();
    filter.$or = [
      { employeeId: new RegExp(q, 'i') },
      { name: new RegExp(q, 'i') },
      { mobile: new RegExp(q, 'i') },
    ];
  }
  if (req.query.active === 'true') filter.active = true;
  if (req.query.active === 'false') filter.active = false;

  const { page, limit, skip } = parsePagination(req.query);
  const [items, total] = await Promise.all([
    userRepository.list({ filter, skip, limit }),
    userRepository.count(filter),
  ]);
  res.json({
    items: items.map((u) => u.toJSON()),
    page: buildPageMeta({ page, limit, total }),
  });
});

const getSurveyor = asyncHandler(async (req, res) => {
  const user = await userRepository.findById(req.params.id);
  if (!user) throw new NotFoundError('User not found');
  res.json({ user: user.toJSON() });
});

const updateSurveyor = asyncHandler(async (req, res) => {
  const user = await userService.updateSurveyor(req.params.id, req.body);
  await auditService.logFromRequest(req, {
    action: auditService.ACTIONS.SURVEYOR_UPDATED,
    entityType: 'User',
    entityId: user._id,
  });
  res.json({ user: user.toJSON() });
});

const activate = asyncHandler(async (req, res) => {
  const user = await userService.setActive(req.params.id, true);
  await auditService.logFromRequest(req, {
    action: auditService.ACTIONS.SURVEYOR_ACTIVATED,
    entityType: 'User',
    entityId: user._id,
  });
  res.json({ user: user.toJSON() });
});

const deactivate = asyncHandler(async (req, res) => {
  const user = await userService.setActive(req.params.id, false);
  await auditService.logFromRequest(req, {
    action: auditService.ACTIONS.SURVEYOR_DEACTIVATED,
    entityType: 'User',
    entityId: user._id,
  });
  res.json({ user: user.toJSON() });
});

const resetPassword = asyncHandler(async (req, res) => {
  const user = await userService.resetPassword(req.params.id, req.body.password);
  await auditService.logFromRequest(req, {
    action: auditService.ACTIONS.PASSWORD_RESET,
    entityType: 'User',
    entityId: user._id,
  });
  res.json({ ok: true });
});

const dashboardStats = asyncHandler(async (_req, res) => {
  res.json(await dashboardService.getStats());
});

const dashboardDaily = asyncHandler(async (req, res) => {
  const days = Math.min(Math.max(parseInt(req.query.days, 10) || 14, 1), 90);
  res.json({ days, points: await dashboardService.dailyCounts(days) });
});

const surveyorPerformance = asyncHandler(async (req, res) => {
  const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 1), 365);
  res.json({ days, items: await dashboardService.surveyorPerformance(days) });
});

const surveyorStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.surveyorStats(req.params.id);
  if (!stats) throw new NotFoundError('Surveyor not found');
  res.json(stats);
});

module.exports = {
  createSurveyor,
  listSurveyors,
  getSurveyor,
  updateSurveyor,
  activate,
  deactivate,
  resetPassword,
  dashboardStats,
  dashboardDaily,
  surveyorPerformance,
  surveyorStats,
};
