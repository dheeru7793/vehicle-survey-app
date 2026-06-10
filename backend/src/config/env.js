'use strict';

require('dotenv').config();

const required = (key) => {
  const v = process.env[key];
  if (!v || v.trim() === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return v;
};

const optional = (key, fallback) => {
  const v = process.env[key];
  return v === undefined || v === '' ? fallback : v;
};

const toInt = (v, fallback) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
};

const env = {
  nodeEnv: optional('NODE_ENV', 'development'),
  port: toInt(optional('PORT', '4000'), 4000),
  logLevel: optional('LOG_LEVEL', 'info'),
  corsOrigins: optional('CORS_ORIGINS', 'http://localhost:3001')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  mongodbUri: required('MONGODB_URI'),

  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: optional('JWT_EXPIRES_IN', '7d'),

  aws: {
    region: required('AWS_REGION'),
    bucket: required('AWS_S3_BUCKET'),
    accessKeyId: optional('AWS_ACCESS_KEY_ID', ''),
    secretAccessKey: optional('AWS_SECRET_ACCESS_KEY', ''),
    signedUrlExpiresSeconds: toInt(
      optional('S3_SIGNED_URL_EXPIRES_SECONDS', '900'),
      900,
    ),
  },

  bootstrapAdmin: {
    employeeId: optional('BOOTSTRAP_ADMIN_EMPLOYEE_ID', 'admin'),
    name: optional('BOOTSTRAP_ADMIN_NAME', 'System Administrator'),
    mobile: optional('BOOTSTRAP_ADMIN_MOBILE', '0000000000'),
    password: optional('BOOTSTRAP_ADMIN_PASSWORD', 'ChangeMe123!'),
  },

  rateLimit: {
    loginWindowMs: toInt(optional('LOGIN_RATE_LIMIT_WINDOW_MS', '900000'), 900000),
    loginMax: toInt(optional('LOGIN_RATE_LIMIT_MAX', '10'), 10),
  },

  uploads: {
    maxPhotoBytes: toInt(optional('MAX_PHOTO_BYTES', '5242880'), 5242880),
    maxPhotosPerRequest: toInt(optional('MAX_PHOTOS_PER_REQUEST', '20'), 20),
  },
};

module.exports = env;
