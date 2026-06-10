'use strict';

const express = require('express');
const authRoutes = require('./auth.routes');
const surveyRoutes = require('./surveys.routes');
const photoRoutes = require('./photos.routes');
const adminRoutes = require('./admin.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/surveys', surveyRoutes);
router.use('/photos', photoRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
