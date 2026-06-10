'use strict';

const mongoose = require('mongoose');

const STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  UPLOADING: 'UPLOADING',
  SYNCED: 'SYNCED',
  FAILED: 'FAILED',
});

const PointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: {
      type: [Number],
      validate: {
        validator: (v) =>
          Array.isArray(v) &&
          v.length === 2 &&
          v[0] >= -180 && v[0] <= 180 &&
          v[1] >= -90 && v[1] <= 90,
        message: 'coordinates must be [longitude, latitude] within valid bounds',
      },
    },
  },
  { _id: false },
);

const SurveySchema = new mongoose.Schema(
  {
    vehicleNumber: { type: String, required: true, uppercase: true, trim: true, index: true },
    surveyorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    surveyorName: { type: String, required: true },
    notes: { type: String, default: '' },
    location: { type: PointSchema, default: undefined },
    status: {
      type: String,
      enum: Object.values(STATUS),
      default: STATUS.PENDING,
      index: true,
    },
    photoCount: { type: Number, default: 0 },
    clientId: { type: String, index: true, sparse: true },
    syncedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

SurveySchema.index({ vehicleNumber: 1, createdAt: -1 });
SurveySchema.index({ surveyorId: 1, createdAt: -1 });
SurveySchema.index({ status: 1, createdAt: -1 });
SurveySchema.index({ location: '2dsphere' });
SurveySchema.index(
  { surveyorId: 1, clientId: 1 },
  { unique: true, partialFilterExpression: { clientId: { $exists: true, $ne: null } } },
);

const Survey = mongoose.model('Survey', SurveySchema);

module.exports = Survey;
module.exports.STATUS = STATUS;
