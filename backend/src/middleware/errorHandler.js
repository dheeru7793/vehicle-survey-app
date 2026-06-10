'use strict';

const logger = require('../config/logger');
const { HttpError } = require('../utils/errors');

function notFoundHandler(_req, _res, next) {
  next(new HttpError(404, 'Route not found'));
}

function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;

  if (status >= 500) {
    logger.error({ err, path: req.originalUrl, method: req.method }, 'Unhandled error');
  } else {
    logger.warn(
      { err: { message: err.message, status, details: err.details }, path: req.originalUrl, method: req.method },
      'Request failed',
    );
  }

  res.status(status).json({
    error: {
      message: status >= 500 && process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
      status,
      details: err.details,
    },
  });
}

module.exports = { notFoundHandler, errorHandler };
