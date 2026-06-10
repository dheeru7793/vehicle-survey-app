'use strict';

const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');
const auditService = require('../services/auditService');

const login = asyncHandler(async (req, res) => {
  const { employeeId, password } = req.body;
  try {
    const { token, user } = await authService.login({ employeeId, password });
    await auditService.log({
      userId: user._id,
      action: auditService.ACTIONS.LOGIN,
      entityType: 'User',
      entityId: user._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'] || '',
    });
    res.json({ token, user: user.toJSON() });
  } catch (err) {
    await auditService.log({
      action: auditService.ACTIONS.LOGIN_FAILED,
      entityType: 'User',
      entityId: null,
      metadata: { employeeId },
      ip: req.ip,
      userAgent: req.headers['user-agent'] || '',
    });
    throw err;
  }
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toJSON() });
});

const logout = asyncHandler(async (req, res) => {
  await auditService.logFromRequest(req, {
    action: auditService.ACTIONS.LOGOUT,
    entityType: 'User',
    entityId: req.user._id,
  });
  res.json({ ok: true });
});

module.exports = { login, me, logout };
