'use strict';

const userRepository = require('../repositories/userRepository');
const authService = require('./authService');
const { ConflictError, NotFoundError, BadRequestError } = require('../utils/errors');
const ROLES = require('../models/User').ROLES;

async function createSurveyor({ employeeId, name, mobile, password }) {
  const existing = await userRepository.findByEmployeeId(employeeId);
  if (existing) throw new ConflictError('Employee ID already exists');
  const passwordHash = await authService.hashPassword(password);
  return userRepository.create({
    employeeId,
    name,
    mobile: mobile || '',
    passwordHash,
    role: ROLES.SURVEYOR,
    active: true,
  });
}

async function updateSurveyor(id, { name, mobile }) {
  const user = await userRepository.findById(id);
  if (!user) throw new NotFoundError('Surveyor not found');
  if (user.role !== ROLES.SURVEYOR) throw new BadRequestError('Target user is not a surveyor');
  const update = {};
  if (name !== undefined) update.name = name;
  if (mobile !== undefined) update.mobile = mobile;
  return userRepository.updateById(id, update);
}

async function setActive(id, active) {
  const user = await userRepository.findById(id);
  if (!user) throw new NotFoundError('User not found');
  return userRepository.setActive(id, Boolean(active));
}

async function resetPassword(id, newPassword) {
  const user = await userRepository.findById(id);
  if (!user) throw new NotFoundError('User not found');
  const passwordHash = await authService.hashPassword(newPassword);
  return userRepository.setPasswordHash(id, passwordHash);
}

module.exports = {
  createSurveyor,
  updateSurveyor,
  setActive,
  resetPassword,
};
