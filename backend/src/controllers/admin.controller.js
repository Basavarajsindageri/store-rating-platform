const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { User, Store, Rating, sequelize } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Get dashboard statistics
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalStores, totalRatings, roleDistribution] = await Promise.all([
      User.count(),
      Store.count(),
      Rating.count(),
      User.findAll({
        attributes: ['role', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['role'],
        raw: true,
      }),
    ]);

    return sendSuccess(
      res,
      {
        totalUsers,
        totalStores,
        totalRatings,
        roleDistribution,
      },
      'Dashboard statistics fetched successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get users list with filtering, sorting, and pagination
 */
const getUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      name,
      email,
      address,
      role,
      sortBy = 'createdAt',
      order = 'DESC',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const offset = (pageNum - 1) * pageSize;

    const where = {};

    // Search across name, email, address
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search.trim()}%` } },
        { email: { [Op.iLike]: `%${search.trim()}%` } },
        { address: { [Op.iLike]: `%${search.trim()}%` } },
      ];
    }

    if (name) {
      where.name = { [Op.iLike]: `%${name.trim()}%` };
    }
    if (email) {
      where.email = { [Op.iLike]: `%${email.trim()}%` };
    }
    if (address) {
      where.address = { [Op.iLike]: `%${address.trim()}%` };
    }
    if (role && ['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'].includes(role)) {
      where.role = role;
    }

    // Validate sortBy column
    const allowedSortColumns = ['name', 'email', 'address', 'role', 'createdAt', 'id'];
    const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { count, rows } = await User.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order: [[sortColumn, sortOrder]],
      attributes: ['id', 'name', 'email', 'address', 'role', 'createdAt', 'updatedAt'],
      include: [
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name'],
        },
      ],
    });

    return sendSuccess(
      res,
      rows,
      'Users fetched successfully',
      200,
      {
        total: count,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(count / pageSize),
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new user (admin only)
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, address, role } = req.body;

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
      role,
    });

    return sendSuccess(
      res,
      newUser.toJSON(),
      'User created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get single user details (with store info and store average rating if store owner)
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'address', 'role', 'createdAt', 'updatedAt'],
      include: [
        {
          model: Store,
          as: 'store',
          attributes: [
            'id',
            'name',
            'email',
            'address',
            [
              sequelize.literal(`(
                SELECT COALESCE(ROUND(AVG("rating")::numeric, 2), 0)
                FROM "ratings"
                WHERE "ratings"."store_id" = "store"."id"
              )`),
              'averageRating',
            ],
            [
              sequelize.literal(`(
                SELECT COUNT(*)
                FROM "ratings"
                WHERE "ratings"."store_id" = "store"."id"
              )`),
              'ratingCount',
            ],
          ],
        },
      ],
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, user, 'User details fetched successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get stores list with average rating, filtering, sorting, and pagination
 */
const getStores = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      name,
      email,
      address,
      sortBy = 'createdAt',
      order = 'DESC',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const offset = (pageNum - 1) * pageSize;

    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search.trim()}%` } },
        { email: { [Op.iLike]: `%${search.trim()}%` } },
        { address: { [Op.iLike]: `%${search.trim()}%` } },
      ];
    }

    if (name) {
      where.name = { [Op.iLike]: `%${name.trim()}%` };
    }
    if (email) {
      where.email = { [Op.iLike]: `%${email.trim()}%` };
    }
    if (address) {
      where.address = { [Op.iLike]: `%${address.trim()}%` };
    }

    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    let orderClause;

    if (sortBy === 'rating' || sortBy === 'averageRating') {
      orderClause = [[sequelize.literal('"averageRating"'), sortOrder]];
    } else {
      const allowedColumns = ['name', 'email', 'address', 'createdAt', 'id'];
      const col = allowedColumns.includes(sortBy) ? sortBy : 'createdAt';
      orderClause = [[col, sortOrder]];
    }

    const { count, rows } = await Store.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order: orderClause,
      attributes: [
        'id',
        'name',
        'email',
        'address',
        'owner_id',
        'createdAt',
        'updatedAt',
        [
          sequelize.literal(`(
            SELECT COALESCE(ROUND(AVG("rating")::numeric, 2), 0)
            FROM "ratings"
            WHERE "ratings"."store_id" = "Store"."id"
          )`),
          'averageRating',
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM "ratings"
            WHERE "ratings"."store_id" = "Store"."id"
          )`),
          'ratingCount',
        ],
      ],
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    return sendSuccess(
      res,
      rows,
      'Stores fetched successfully',
      200,
      {
        total: count,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(count / pageSize),
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new store (admin only)
 */
const createStore = async (req, res, next) => {
  try {
    const { name, email, address, owner_id } = req.body;

    const existingStore = await Store.findOne({ where: { email } });
    if (existingStore) {
      return sendError(res, 'A store with this email address already exists', 409, {
        email: 'Store email already in use',
      });
    }

    // If owner_id provided, verify that the user exists and has STORE_OWNER role, and doesn't already own a store
    if (owner_id) {
      const owner = await User.findByPk(owner_id);
      if (!owner) {
        return sendError(res, 'Specified store owner user not found', 404, {
          owner_id: 'User not found',
        });
      }

      if (owner.role !== 'STORE_OWNER') {
        return sendError(res, 'Assigned user must have the STORE_OWNER role', 400, {
          owner_id: 'User is not a STORE_OWNER',
        });
      }

      const existingOwnedStore = await Store.findOne({ where: { owner_id } });
      if (existingOwnedStore) {
        return sendError(res, 'This store owner is already assigned to another store', 409, {
          owner_id: 'Owner already assigned to a store',
        });
      }
    }

    const newStore = await Store.create({
      name,
      email,
      address,
      owner_id: owner_id || null,
    });

    const storeWithOwner = await Store.findByPk(newStore.id, {
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }],
    });

    return sendSuccess(
      res,
      storeWithOwner,
      'Store created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get store owners who are not yet assigned to any store
 */
const getUnassignedOwners = async (req, res, next) => {
  try {
    const assignedStores = await Store.findAll({
      attributes: ['owner_id'],
      where: { owner_id: { [Op.ne]: null } },
      raw: true,
    });

    const assignedOwnerIds = assignedStores.map((s) => s.owner_id);

    const unassignedOwners = await User.findAll({
      where: {
        role: 'STORE_OWNER',
        ...(assignedOwnerIds.length > 0 ? { id: { [Op.notIn]: assignedOwnerIds } } : {}),
      },
      attributes: ['id', 'name', 'email'],
      order: [['name', 'ASC']],
    });

    return sendSuccess(res, unassignedOwners, 'Unassigned store owners fetched successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  createUser,
  getUserById,
  getStores,
  createStore,
  getUnassignedOwners,
};
