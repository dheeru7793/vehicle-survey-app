'use strict';

const AuditLog = require('../models/AuditLog');
const logger = require('../config/logger');

async function log({ userId = null, action, entityType = '', entityId = null, metadata = {}, ip = '', userAgent = '' }) {
  try {
    await AuditLog.create({
      userId,
      action,
      entityType,
      entityId,
      metadata,
      ip,
      userAgent,
      timestamp: new Date(),
    });
  } catch (e) {
    logger.warn({ err: e, action }, 'Failed to persist audit log');
  }
}

function logFromRequest(req, payload) {
  return log({
    userId: req.user?._id || null,
    ip: req.ip,
    userAgent: req.headers['user-agent'] || '',
    ...payload,
  });
}

module.exports = { log, logFromRequest, ACTIONS: AuditLog.ACTIONS };
