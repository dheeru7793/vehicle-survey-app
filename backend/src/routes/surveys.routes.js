'use strict';

const express = require('express');
const Joi = require('joi');

const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const controller = require('../controllers/surveyController');
const photoController = require('../controllers/photoController');
const { uploadMw } = require('../middleware/upload');

const router = express.Router();

router.use(requireAuth);

const createSchema = Joi.object({
  vehicleNumber: Joi.string().required(),
  notes: Joi.string().allow('').default(''),
  latitude: Joi.number().min(-90).max(90),
  longitude: Joi.number().min(-180).max(180),
  status: Joi.string().valid('PENDING', 'UPLOADING', 'SYNCED', 'FAILED'),
  clientId: Joi.string().uuid({ version: ['uuidv4'] }).optional(),
});

const updateSchema = Joi.object({
  vehicleNumber: Joi.string(),
  notes: Joi.string().allow(''),
  latitude: Joi.number().min(-90).max(90),
  longitude: Joi.number().min(-180).max(180),
  status: Joi.string().valid('PENDING', 'UPLOADING', 'SYNCED', 'FAILED'),
});

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  vehicleNumber: Joi.string(),
  status: Joi.string(),
  surveyorId: Joi.string().hex().length(24),
  from: Joi.date().iso(),
  to: Joi.date().iso(),
  sort: Joi.string().valid('createdAt', 'vehicleNumber', 'status'),
  order: Joi.string().valid('asc', 'desc'),
});

/**
 * @openapi
 * /surveys:
 *   post:
 *     tags: [Surveys]
 *     summary: Create a new survey
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vehicleNumber]
 *             properties:
 *               vehicleNumber: { type: string, example: 'mh12-ab 1234' }
 *               notes:         { type: string }
 *               latitude:      { type: number }
 *               longitude:     { type: number }
 *               status:        { type: string, enum: [PENDING, UPLOADING, SYNCED, FAILED] }
 *               clientId:      { type: string, format: uuid, description: 'Idempotency key from mobile' }
 *     responses:
 *       201: { description: created }
 *   get:
 *     tags: [Surveys]
 *     summary: List surveys (own surveys for SURVEYOR, all for ADMIN)
 */
router.post('/', validate({ body: createSchema }), controller.create);
router.get('/', validate({ query: listQuerySchema }), controller.list);

/**
 * @openapi
 * /surveys/duplicate-check:
 *   get:
 *     tags: [Surveys]
 *     summary: Check if a recent survey exists for the given vehicle number
 *     parameters:
 *       - in: query
 *         name: vehicleNumber
 *         required: true
 *         schema: { type: string }
 */
router.get(
  '/duplicate-check',
  validate({ query: Joi.object({ vehicleNumber: Joi.string().required() }) }),
  controller.duplicateCheck,
);

/**
 * @openapi
 * /surveys/{id}:
 *   get:
 *     tags: [Surveys]
 *     summary: Get a single survey
 *   patch:
 *     tags: [Surveys]
 *     summary: Update a survey
 */
router.get(
  '/:id',
  validate({ params: Joi.object({ id: Joi.string().hex().length(24).required() }) }),
  controller.getById,
);
router.patch(
  '/:id',
  validate({
    params: Joi.object({ id: Joi.string().hex().length(24).required() }),
    body: updateSchema,
  }),
  controller.update,
);

/**
 * @openapi
 * /surveys/{id}/photos:
 *   post:
 *     tags: [Photos]
 *     summary: Upload one or more photos for a survey
 *     consumes: [multipart/form-data]
 *   get:
 *     tags: [Photos]
 *     summary: List photos for a survey (with signed URLs)
 */
router.post(
  '/:id/photos',
  validate({ params: Joi.object({ id: Joi.string().hex().length(24).required() }) }),
  uploadMw,
  photoController.upload,
);
router.get(
  '/:id/photos',
  validate({ params: Joi.object({ id: Joi.string().hex().length(24).required() }) }),
  photoController.listForSurvey,
);

/**
 * @openapi
 * /surveys/{id}/photos/zip:
 *   get:
 *     tags: [Photos]
 *     summary: Download all photos for a survey as a ZIP
 */
router.get(
  '/:id/photos/zip',
  validate({ params: Joi.object({ id: Joi.string().hex().length(24).required() }) }),
  photoController.downloadZip,
);

module.exports = router;
