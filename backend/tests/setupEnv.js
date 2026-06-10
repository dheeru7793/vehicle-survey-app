'use strict';

// Provide deterministic env BEFORE config/env.js loads.
process.env.NODE_ENV = 'test';
process.env.PORT = '0';
process.env.LOG_LEVEL = 'silent';
process.env.CORS_ORIGINS = '*';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://placeholder/will-be-overridden';
process.env.JWT_SECRET = 'test-secret-not-for-production';
process.env.JWT_EXPIRES_IN = '1d';
process.env.AWS_REGION = 'ap-south-1';
process.env.AWS_S3_BUCKET = 'test-bucket';
process.env.AWS_ACCESS_KEY_ID = 'test-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
process.env.BOOTSTRAP_ADMIN_PASSWORD = 'TestPass123!';
