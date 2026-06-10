'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

function extractToken(req) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (header && header.startsWith('Bearer ')) return header.slice('Bearer '.length).trim();
  if (req.cookies?.auth_token) return req.cookies.auth_token;
  return null;
}

async function requireAuth(req, _res, next) {
  try {
    const token = extractToken(req);
    if (!token) throw new UnauthorizedError('Missing authentication token');

    let payload;
    try {
      payload = jwt.verify(token, env.jwtSecret);
    } catch (_e) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    const user = await User.findById(payload.sub);
    if (!user) throw new UnauthorizedError('User no longer exists');
    if (!user.active) throw new ForbiddenError('User account is deactivated');

    req.user = user;
    req.auth = { sub: String(user._id), role: user.role, employeeId: user.employeeId };
    return next();
  } catch (err) {
    return next(err);
  }
}

function requireRole(...allowed) {
  return function roleMw(req, _res, next) {
    if (!req.user) return next(new UnauthorizedError());
    if (!allowed.includes(req.user.role)) {
      return next(new ForbiddenError(`Requires one of roles: ${allowed.join(', ')}`));
    }
    return next();
  };
}

module.exports = { requireAuth, requireRole, extractToken };
