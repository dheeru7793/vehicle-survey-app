'use strict';

const SurveyPhoto = require('../models/SurveyPhoto');

const surveyPhotoRepository = {
  findById: (id) => SurveyPhoto.findById(id),
  create: (doc) => SurveyPhoto.create(doc),
  listBySurvey: (surveyId) =>
    SurveyPhoto.find({ surveyId }).sort({ sequenceNo: 1 }),
  deleteById: (id) => SurveyPhoto.findByIdAndDelete(id),
  countBySurvey: (surveyId) => SurveyPhoto.countDocuments({ surveyId }),
  maxSequenceNo: async (surveyId) => {
    const last = await SurveyPhoto.findOne({ surveyId }).sort({ sequenceNo: -1 }).select('sequenceNo');
    return last ? last.sequenceNo : 0;
  },
};

module.exports = surveyPhotoRepository;
