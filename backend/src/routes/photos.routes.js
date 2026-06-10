'use strict';

const express = require('express');
const Joi = require('joi');

const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const controller = require('../controllers/photoController');

const router = express.Router();

router.use(requireAuth);

/**
 * @openapi
 * /photos/{photoId}:
 *   delete:
 *     tags: [Photos]
 *     summary: Delete a single photo
 */
router.delete(
  '/:photoId',
  validate({ params: Joi.object({ photoId: Joi.string().hex().length(24).required() }) }),
  controller.remove,
);

module.exports = router;
