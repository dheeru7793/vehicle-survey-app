'use strict';

const mongoose = require('mongoose');

const ACTIONS = Object.freeze({
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  LOGIN_FAILED: 'LOGIN_FAILED',
  SURVEY_CREATED: 'SURVEY_CREATED',
  SURVEY_UPDATED: 'SURVEY_UPDATED',
  SURVEY_SYNCED: 'SURVEY_SYNCED',
  PHOTO_UPLOADED: 'PHOTO_UPLOADED',
  PHOTO_DELETED: 'PHOTO_DELETED',
  SURVEYOR_CREATED: 'SURVEYOR_CREATED',
  SURVEYOR_UPDATED: 'SURVEYOR_UPDATED',
  SURVEYOR_ACTIVATED: 'SURVEYOR_ACTIVATED',
  SURVEYOR_DEACTIVATED: 'SURVEYOR_DEACTIVATED',
  PASSWORD_RESET: 'PASSWORD_RESET',
});

const AuditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    action: { type: String, enum: Object.values(ACTIONS), required: true, index: true },
    entityType: { type: String, default: '' },
    entityId: { type: mongoose.Schema.Types.Mixed, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    timestamp: { type: Date, default: () => new Date(), index: true },
  },
  { timestamps: false },
);

AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ userId: 1, timestamp: -1 });

const AuditLog = mongoose.model('AuditLog', AuditLogSchema);

module.exports = AuditLog;
module.exports.ACTIONS = ACTIONS;
