'use strict';

class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

class BadRequestError extends HttpError {
  constructor(message = 'Bad request', details) { super(400, message, details); }
}
class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized') { super(401, message); }
}
class ForbiddenError extends HttpError {
  constructor(message = 'Forbidden') { super(403, message); }
}
class NotFoundError extends HttpError {
  constructor(message = 'Not found') { super(404, message); }
}
class ConflictError extends HttpError {
  constructor(message = 'Conflict', details) { super(409, message, details); }
}

module.exports = {
  HttpError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
};
