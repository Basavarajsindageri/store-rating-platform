const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Store } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');

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

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return sendError(res, 'A user with this email address already exists', 409, {
        email: 'Email address already in use',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
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
      where: { email },
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

module.exports = {
  register,
  login,
  getMe,
  changePassword,
};
