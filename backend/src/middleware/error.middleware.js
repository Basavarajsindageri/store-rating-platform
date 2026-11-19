const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('[Error Middleware]:', err);

  // Sequelize Unique Constraint Error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const errorMap = {};
    err.errors.forEach((e) => {
      errorMap[e.path] = e.message;
    });
    return sendError(res, 'Record with this data already exists', 409, errorMap);
  }

  // Sequelize Validation Error
  if (err.name === 'SequelizeValidationError') {
    const errorMap = {};
    err.errors.forEach((e) => {
      errorMap[e.path] = e.message;
    });
    return sendError(res, 'Validation error occurred', 400, errorMap);
  }

  // Sequelize Database Error
  if (err.name === 'SequelizeDatabaseError') {
    return sendError(res, 'Database error occurred', 500, { detail: err.message });
  }

  // JSON parsing error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 'Malformed JSON payload', 400);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred';

  return sendError(res, message, statusCode);
};

module.exports = errorHandler;
