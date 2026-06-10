'use strict';

const Survey = require('../models/Survey');
const User = require('../models/User');
const surveyRepository = require('../repositories/surveyRepository');

function startOfDay(d = new Date()) {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}
function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

async function getStats() {
  const now = new Date();
  const today = startOfDay(now);
  const monthStart = startOfMonth(now);

  const [total, todayCount, monthCount, pending, failed, statuses, surveyors] = await Promise.all([
    Survey.countDocuments({}),
    Survey.countDocuments({ createdAt: { $gte: today } }),
    Survey.countDocuments({ createdAt: { $gte: monthStart } }),
    Survey.countDocuments({ status: 'PENDING' }),
    Survey.countDocuments({ status: 'FAILED' }),
    surveyRepository.countByStatus(),
    User.countDocuments({ role: 'SURVEYOR', active: true }),
  ]);

  return {
    totals: { total, today: todayCount, month: monthCount, pending, failed, activeSurveyors: surveyors },
    byStatus: statuses.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
  };
}

async function dailyCounts(days = 14) {
  return surveyRepository.dailyCounts(days);
}

async function surveyorPerformance(days = 30) {
  return surveyRepository.surveyorPerformance(days);
}

async function surveyorStats(surveyorId) {
  const user = await User.findById(surveyorId);
  if (!user) return null;

  const today = startOfDay();
  const monthStart = startOfMonth();
  const [total, monthCount, todayCount] = await Promise.all([
    Survey.countDocuments({ surveyorId }),
    Survey.countDocuments({ surveyorId, createdAt: { $gte: monthStart } }),
    Survey.countDocuments({ surveyorId, createdAt: { $gte: today } }),
  ]);

  return {
    surveyor: user.toJSON(),
    totals: { total, today: todayCount, month: monthCount },
    lastLoginAt: user.lastLoginAt,
  };
}

module.exports = { getStats, dailyCounts, surveyorPerformance, surveyorStats };
