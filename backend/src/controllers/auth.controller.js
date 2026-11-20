const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User, Store, PasswordResetToken } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');
const { sendPasswordResetEmail, getLastDevToken } = require('../services/mail.service');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    }
  );
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, address } = req.body;

    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return sendError(res, 'A user with this email address already exists', 409, {
        email: 'Email address already in use',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password_hash,
      address,
      role: 'NORMAL_USER',
    });

    const token = generateToken(newUser);

    return sendSuccess(
      res,
      {
        user: newUser.toJSON(),
        token,
      },
      'User registered successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email: email.toLowerCase() },
      include: [
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name', 'email', 'address'],
        },
      ],
    });

    if (!user) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const token = generateToken(user);

    return sendSuccess(
      res,
      {
        user: user.toJSON(),
        token,
      },
      'Logged in successfully'
    );
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name', 'email', 'address'],
        },
      ],
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, { user: user.toJSON() }, 'Profile fetched successfully');
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 'Current password does not match', 400, {
        currentPassword: 'Incorrect current password',
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);
    await user.save();

    return sendSuccess(res, null, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset (Forgot Password)
 * ALWAYS returns the generic message regardless of email existence (prevent enumeration)
 */
const forgotPassword = async (req, res, next) => {
  const genericMessage = 'If this email exists, a reset link has been sent';
  try {
    const { email } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (user) {
      // Generate 32 bytes crypto random token
      const rawToken = crypto.randomBytes(32).toString('hex');
      // Calculate SHA-256 hash to store in DB
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

      await PasswordResetToken.create({
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      });

      // Send reset email (handles Ethereal / console logging in development)
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        token: rawToken,
      });
    } else {
      // Simulate equivalent computation time to prevent timing attacks
      const dummyToken = crypto.randomBytes(32).toString('hex');
      crypto.createHash('sha256').update(dummyToken).digest('hex');
    }

    return sendSuccess(res, null, genericMessage, 200);
  } catch (error) {
    // Even on error, log internally and return generic message
    console.error('[Forgot Password Error]:', error);
    return sendSuccess(res, null, genericMessage, 200);
  }
};

/**
 * Verify if reset token is valid and unexpired (for UI feedback)
 */
const verifyResetToken = async (req, res, next) => {
  try {
    const { token } = req.params;
    if (!token) {
      return sendError(res, 'Token is missing', 400, { reason: 'invalid' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const tokenRecord = await PasswordResetToken.findOne({
      where: { token_hash: tokenHash },
    });

    if (!tokenRecord) {
      return sendError(res, 'Invalid password reset link', 400, { reason: 'invalid' });
    }

    if (tokenRecord.used_at) {
      return sendError(res, 'This password reset link has already been used', 400, {
        reason: 'used',
      });
    }

    if (new Date() > new Date(tokenRecord.expires_at)) {
      return sendError(res, 'This password reset link has expired', 400, {
        reason: 'expired',
      });
    }

    return sendSuccess(res, { valid: true }, 'Token is valid', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password with verified token
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return sendError(res, 'Reset token is required', 400);
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const tokenRecord = await PasswordResetToken.findOne({
      where: { token_hash: tokenHash },
      include: [{ model: User, as: 'user' }],
    });

    if (!tokenRecord) {
      return sendError(res, 'Invalid password reset link', 400);
    }

    if (tokenRecord.used_at) {
      return sendError(res, 'This password reset link has already been used', 400);
    }

    if (new Date() > new Date(tokenRecord.expires_at)) {
      return sendError(res, 'This password reset link has expired', 400);
    }

    const user = tokenRecord.user;
    if (!user) {
      return sendError(res, 'User associated with this reset request no longer exists', 404);
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(password, salt);
    await user.save();

    // Mark current token as used
    tokenRecord.used_at = new Date();
    await tokenRecord.save();

    // Delete any other pending tokens for this user
    await PasswordResetToken.destroy({
      where: {
        user_id: user.id,
        id: { [Op.ne]: tokenRecord.id },
      },
    });

    return sendSuccess(res, null, 'Password has been reset successfully. You can now log in.');
  } catch (error) {
    next(error);
  }
};

/**
 * Dev-only helper to inspect last generated token for automated tests
 */
const getDevToken = (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ success: false });
  }
  const token = getLastDevToken(req.query.email);
  return res.json({ success: true, token });
};

module.exports = {
  register,
  login,
  getMe,
  changePassword,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  getDevToken,
};
