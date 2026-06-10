'use strict';

const express = require('express');
const Joi = require('joi');

const { requireAuth, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const controller = require('../controllers/adminController');
const surveyController = require('../controllers/surveyController');
const { ROLES } = require('../models/User');

const router = express.Router();

router.use(requireAuth, requireRole(ROLES.ADMIN));

const idParam = Joi.object({ id: Joi.string().hex().length(24).required() });

/**
 * @openapi
 * /admin/dashboard/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Dashboard summary stats
 */
router.get('/dashboard/stats', controller.dashboardStats);
router.get('/dashboard/daily', controller.dashboardDaily);
router.get('/dashboard/surveyor-performance', controller.surveyorPerformance);

/**
 * @openapi
 * /admin/surveys:
 *   get:
 *     tags: [Admin]
 *     summary: List ALL surveys with admin filters
 */
router.get('/surveys', surveyController.list);

/**
 * @openapi
 * /admin/surveyors:
 *   get:
 *     tags: [Admin]
 *     summary: List surveyors
 *   post:
 *     tags: [Admin]
 *     summary: Create a surveyor
 */
router.get(
  '/surveyors',
  validate({
    query: Joi.object({
      q: Joi.string(),
      active: Joi.string().valid('true', 'false'),
      page: Joi.number().integer().min(1),
      limit: Joi.number().integer().min(1).max(100),
    }),
  }),
  controller.listSurveyors,
);

router.post(
  '/surveyors',
  validate({
    body: Joi.object({
      employeeId: Joi.string().trim().min(2).max(40).required(),
      name: Joi.string().trim().min(1).max(120).required(),
      mobile: Joi.string().trim().max(20).allow(''),
      password: Joi.string().min(6).max(128).required(),
    }),
  }),
  controller.createSurveyor,
);

router.get('/surveyors/:id', validate({ params: idParam }), controller.getSurveyor);
router.get('/surveyors/:id/stats', validate({ params: idParam }), controller.surveyorStats);

router.patch(
  '/surveyors/:id',
  validate({
    params: idParam,
    body: Joi.object({
      name: Joi.string().trim().min(1).max(120),
      mobile: Joi.string().trim().max(20).allow(''),
    }).min(1),
  }),
  controller.updateSurveyor,
);

router.post('/surveyors/:id/activate', validate({ params: idParam }), controller.activate);
router.post('/surveyors/:id/deactivate', validate({ params: idParam }), controller.deactivate);

router.post(
  '/surveyors/:id/reset-password',
  validate({
    params: idParam,
    body: Joi.object({ password: Joi.string().min(6).max(128).required() }),
  }),
  controller.resetPassword,
);

module.exports = router;
