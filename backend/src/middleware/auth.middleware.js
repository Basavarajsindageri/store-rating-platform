const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { sendError } = require('../utils/response');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication token missing or invalid', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return sendError(res, 'User account no longer exists', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token has expired. Please log in again', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid token. Please log in again', 401);
    }
    return sendError(res, 'Authentication failed', 401);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Unauthenticated request', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access forbidden: requires one of the following roles: [${roles.join(', ')}]`,
        403
      );
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
