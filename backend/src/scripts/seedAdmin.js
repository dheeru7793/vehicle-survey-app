'use strict';

/**
 * Bootstrap or update the first admin user.
 * Reads BOOTSTRAP_ADMIN_* env vars.
 *
 *   node src/scripts/seedAdmin.js
 */

const env = require('../config/env');
const logger = require('../config/logger');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const authService = require('../services/authService');

(async () => {
  try {
    await connectDB();
    const { employeeId, name, mobile, password } = env.bootstrapAdmin;

    let user = await User.findOne({ employeeId });
    const passwordHash = await authService.hashPassword(password);

    if (user) {
      user.name = name;
      user.mobile = mobile;
      user.passwordHash = passwordHash;
      user.role = 'ADMIN';
      user.active = true;
      await user.save();
      logger.info({ employeeId }, 'Admin user updated');
    } else {
      user = await User.create({
        employeeId,
        name,
        mobile,
        passwordHash,
        role: 'ADMIN',
        active: true,
      });
      logger.info({ employeeId, id: String(user._id) }, 'Admin user created');
    }
    console.log(`\nAdmin ready. employeeId="${employeeId}", password="${password}"`);
    console.log('CHANGE THE PASSWORD IMMEDIATELY in production.\n');
  } catch (err) {
    logger.error({ err }, 'Seed failed');
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
})();
