const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    for (const validation of validations) {
      const result = await validation.run(req);
      // continue running to catch all errors
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format field-level errors
    const errorMap = {};
    errors.array().forEach((err) => {
      // Use err.path for express-validator v7
      const field = err.path || err.param;
      if (!errorMap[field]) {
        errorMap[field] = err.msg;
      }
    });

    return sendError(res, 'Validation failed', 400, errorMap);
  };
};

module.exports = validate;
