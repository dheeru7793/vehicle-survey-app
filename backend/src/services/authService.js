'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const env = require('../config/env');
const userRepository = require('../repositories/userRepository');
const { UnauthorizedError, ForbiddenError, BadRequestError } = require('../utils/errors');

const BCRYPT_COST = 12;

function signToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      role: user.role,
      employeeId: user.employeeId,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
}

async function hashPassword(plain) {
  if (!plain || plain.length < 6) {
    throw new BadRequestError('Password must be at least 6 characters');
  }
  return bcrypt.hash(plain, BCRYPT_COST);
}

async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

async function login({ employeeId, password }) {
  const user = await userRepository.findByEmployeeId(employeeId);
  if (!user) throw new UnauthorizedError('Invalid credentials');
  if (!user.active) throw new ForbiddenError('Account is deactivated');
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw new UnauthorizedError('Invalid credentials');
  await userRepository.updateLastLogin(user._id);
  return { token: signToken(user), user };
}

module.exports = {
  signToken,
  hashPassword,
  verifyPassword,
  login,
};
