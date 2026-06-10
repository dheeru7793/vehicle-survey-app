'use strict';

const Survey = require('../models/Survey');

const surveyRepository = {
  findById: (id) => Survey.findById(id),
  findByClientId: (surveyorId, clientId) =>
    Survey.findOne({ surveyorId, clientId }),
  create: (doc) => Survey.create(doc),
  updateById: (id, update) =>
    Survey.findByIdAndUpdate(id, update, { new: true }),
  incrementPhotoCount: (id, delta = 1) =>
    Survey.findByIdAndUpdate(id, { $inc: { photoCount: delta } }, { new: true }),
  list: ({ filter = {}, skip = 0, limit = 20, sort = { createdAt: -1 } } = {}) =>
    Survey.find(filter).sort(sort).skip(skip).limit(limit),
  count: (filter = {}) => Survey.countDocuments(filter),
  recentByVehicle: (vehicleNumber, sinceDate) =>
    Survey.findOne({ vehicleNumber, createdAt: { $gte: sinceDate } }).sort({ createdAt: -1 }),
  countByStatus: () =>
    Survey.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  dailyCounts: (days = 14) => {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return Survey.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  },
  surveyorPerformance: (days = 30) => {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return Survey.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { surveyorId: '$surveyorId', surveyorName: '$surveyorName' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);
  },
};

module.exports = surveyRepository;
