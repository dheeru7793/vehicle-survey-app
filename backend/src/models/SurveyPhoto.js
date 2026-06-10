'use strict';

const mongoose = require('mongoose');

const SurveyPhotoSchema = new mongoose.Schema(
  {
    surveyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Survey',
      required: true,
      index: true,
    },
    vehicleNumber: { type: String, required: true, index: true },
    s3Key: { type: String, required: true, unique: true },
    s3ThumbKey: { type: String, default: '' },
    sequenceNo: { type: Number, required: true },
    sizeBytes: { type: Number, default: 0 },
    mimeType: { type: String, default: 'image/jpeg' },
    uploadedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true },
);

SurveyPhotoSchema.index({ surveyId: 1, sequenceNo: 1 }, { unique: true });

const SurveyPhoto = mongoose.model('SurveyPhoto', SurveyPhotoSchema);

module.exports = SurveyPhoto;
