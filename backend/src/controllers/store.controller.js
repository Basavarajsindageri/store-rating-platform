const { Op } = require('sequelize');
const { Store, Rating, sequelize } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Get all stores with user's own rating and average rating
 */
const getStores = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      name,
      address,
      sortBy = 'name',
      order = 'ASC',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const offset = (pageNum - 1) * pageSize;

    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search.trim()}%` } },
        { address: { [Op.iLike]: `%${search.trim()}%` } },
      ];
    }

    if (name) {
      where.name = { [Op.iLike]: `%${name.trim()}%` };
    }
    if (address) {
      where.address = { [Op.iLike]: `%${address.trim()}%` };
    }

    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    let orderClause;

    if (sortBy === 'rating' || sortBy === 'averageRating') {
      orderClause = [[sequelize.literal('"averageRating"'), sortOrder]];
    } else {
      const allowedColumns = ['name', 'address', 'createdAt', 'id'];
      const col = allowedColumns.includes(sortBy) ? sortBy : 'name';
      orderClause = [[col, sortOrder]];
    }

    const currentUserId = req.user ? parseInt(req.user.id, 10) : 0;

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
        [
          sequelize.literal(`(
            SELECT "rating"
            FROM "ratings"
            WHERE "ratings"."store_id" = "Store"."id"
              AND "ratings"."user_id" = ${currentUserId}
            LIMIT 1
          )`),
          'userRating',
        ],
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
 * Submit or update a rating for a store (upsert)
 */
const submitRating = async (req, res, next) => {
  try {
    const storeId = parseInt(req.params.id, 10);
    const ratingValue = parseInt(req.body.rating, 10);
    const userId = req.user.id;

    const store = await Store.findByPk(storeId);
    if (!store) {
      return sendError(res, 'Store not found', 404);
    }

    let userRating = await Rating.findOne({
      where: {
        user_id: userId,
        store_id: storeId,
      },
    });

    let isUpdated = false;

    if (userRating) {
      userRating.rating = ratingValue;
      await userRating.save();
      isUpdated = true;
    } else {
      userRating = await Rating.create({
        user_id: userId,
        store_id: storeId,
        rating: ratingValue,
      });
    }

    // Fetch updated store stats
    const stats = await Rating.findOne({
      where: { store_id: storeId },
      attributes: [
        [sequelize.fn('ROUND', sequelize.fn('AVG', sequelize.col('rating')), 2), 'averageRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'ratingCount'],
      ],
      raw: true,
    });

    return sendSuccess(
      res,
      {
        rating: userRating,
        storeStats: {
          averageRating: parseFloat(stats.averageRating) || 0,
          ratingCount: parseInt(stats.ratingCount, 10) || 0,
        },
      },
      isUpdated ? 'Rating updated successfully' : 'Rating submitted successfully',
      isUpdated ? 200 : 201
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStores,
  submitRating,
};
