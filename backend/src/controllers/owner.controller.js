const { Op } = require('sequelize');
const { Store, Rating, User, sequelize } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Get store dashboard details for the logged-in store owner
 */
const getOwnerDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    const store = await Store.findOne({
      where: { owner_id: ownerId },
      attributes: [
        'id',
        'name',
        'email',
        'address',
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
    });

    if (!store) {
      return sendSuccess(
        res,
        {
          hasStore: false,
          store: null,
          stats: null,
        },
        'No store currently assigned to your owner account'
      );
    }

    // Rating breakdown (1 to 5 stars)
    const breakdownRows = await Rating.findAll({
      where: { store_id: store.id },
      attributes: ['rating', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['rating'],
      raw: true,
    });

    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    breakdownRows.forEach((row) => {
      breakdown[row.rating] = parseInt(row.count, 10);
    });

    return sendSuccess(
      res,
      {
        hasStore: true,
        store,
        breakdown,
      },
      'Store owner dashboard data fetched successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get users who rated the owner's store, with filtering, sorting, and pagination
 */
const getStoreRatings = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    const store = await Store.findOne({
      where: { owner_id: ownerId },
    });

    if (!store) {
      return sendError(res, 'No store assigned to this owner account', 404);
    }

    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      order = 'DESC',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const offset = (pageNum - 1) * pageSize;

    const userWhere = {};
    if (search) {
      userWhere[Op.or] = [
        { name: { [Op.iLike]: `%${search.trim()}%` } },
        { email: { [Op.iLike]: `%${search.trim()}%` } },
      ];
    }

    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    let orderClause;

    if (sortBy === 'name') {
      orderClause = [[{ model: User, as: 'user' }, 'name', sortOrder]];
    } else if (sortBy === 'email') {
      orderClause = [[{ model: User, as: 'user' }, 'email', sortOrder]];
    } else if (sortBy === 'rating') {
      orderClause = [['rating', sortOrder]];
    } else {
      orderClause = [['createdAt', sortOrder]];
    }

    const { count, rows } = await Rating.findAndCountAll({
      where: { store_id: store.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
          where: Object.keys(userWhere).length > 0 ? userWhere : undefined,
        },
      ],
      limit: pageSize,
      offset,
      order: orderClause,
    });

    return sendSuccess(
      res,
      rows,
      'Ratings fetched successfully',
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

module.exports = {
  getOwnerDashboard,
  getStoreRatings,
};
