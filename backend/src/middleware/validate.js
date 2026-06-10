'use strict';

const { BadRequestError } = require('../utils/errors');

/**
 * validate({ body, query, params }) -> express middleware
 * Each value is a Joi schema. Validated/sanitized data is written back
 * onto req.body / req.query / req.params.
 */
module.exports = function validate(schemas) {
  return function validateMw(req, _res, next) {
    for (const key of ['body', 'query', 'params']) {
      const schema = schemas?.[key];
      if (!schema) continue;
      const { value, error } = schema.validate(req[key], {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });
      if (error) {
        const details = error.details.map((d) => ({ path: d.path.join('.'), message: d.message }));
        return next(new BadRequestError('Validation failed', details));
      }
      req[key] = value;
    }
    return next();
  };
};
