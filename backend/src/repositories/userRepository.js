'use strict';

const User = require('../models/User');

const userRepository = {
  findById: (id) => User.findById(id),
  findByEmployeeId: (employeeId) =>
    User.findOne({ employeeId: String(employeeId).trim() }),
  create: (doc) => User.create(doc),
  list: ({ filter = {}, skip = 0, limit = 20, sort = { createdAt: -1 } } = {}) =>
    User.find(filter).sort(sort).skip(skip).limit(limit),
  count: (filter = {}) => User.countDocuments(filter),
  updateById: (id, update) => User.findByIdAndUpdate(id, update, { new: true }),
  setActive: (id, active) => User.findByIdAndUpdate(id, { active }, { new: true }),
  setPasswordHash: (id, passwordHash) => User.findByIdAndUpdate(id, { passwordHash }, { new: true }),
  updateLastLogin: (id, when = new Date()) =>
    User.findByIdAndUpdate(id, { lastLoginAt: when }, { new: false }),
};

module.exports = userRepository;
