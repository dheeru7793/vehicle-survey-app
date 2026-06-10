'use strict';

const express = require('express');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');

const env = require('../config/env');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const controller = require('../controllers/authController');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: env.rateLimit.loginWindowMs,
  max: env.rateLimit.loginMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { status: 429, message: 'Too many login attempts. Try again later.' } },
});

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with employee ID and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeId, password]
 *             properties:
 *               employeeId: { type: string, example: admin }
 *               password:   { type: string, example: ChangeMe123! }
 *     responses:
 *       200:
 *         description: JWT token + user
 *       401: { description: Invalid credentials }
 *       429: { description: Too many attempts }
 */
router.post(
  '/login',
  loginLimiter,
  validate({
    body: Joi.object({
      employeeId: Joi.string().trim().required(),
      password: Joi.string().min(1).required(),
    }),
  }),
  controller.login,
);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Return the authenticated user
 *     responses:
 *       200: { description: Current user }
 */
router.get('/me', requireAuth, controller.me);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout (audit only; client must drop the token)
 *     responses:
 *       200: { description: ok }
 */
router.post('/logout', requireAuth, controller.logout);

module.exports = router;
