const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Review = require("../models/Review");
const Category = require("../models/Category");
const {
  escapeRegex,
  parsePagination,
  buildPagination,
} = require("../utils/helpers");

const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalCategories,
      totalOrders,
      totalReviews,
      pendingOrders,
      deliveredOrders,
      revenueResult,
    ] = await Promise.all([
      User.countDocuments(),

      Product.countDocuments({
        isActive: true,
      }),

      Category.countDocuments({
        isActive: true,
      }),

      Order.countDocuments(),

      Review.countDocuments(),

      Order.countDocuments({
        orderStatus: "pending",
      }),

      Order.countDocuments({
        orderStatus: "delivered",
      }),

      Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$totalAmount",
            },
          },
        },
      ]),
    ]);

    const totalRevenue =
      revenueResult.length > 0
        ? revenueResult[0].total
        : 0;

    res.status(200).json({
      stats: {
        totalUsers,
        totalProducts,
        totalCategories,
        totalOrders,
        totalReviews,
        pendingOrders,
        deliveredOrders,
        totalRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getRecentOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({
        createdAt: -1,
      })
      .limit(10);

    res.status(200).json({
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// All products, including inactive ones.
// ?page=&limit=&q=&status=active|inactive
const getAdminProducts = async (req, res, next) => {
  try {
    const { q, status } = req.query;
    const pagination = parsePagination(req.query, {
      defaultLimit: 20,
      maxLimit: 100,
    });

    const filter = {};

    if (typeof q === "string" && q.trim()) {
      filter.name = { $regex: escapeRegex(q.trim()), $options: "i" };
    }

    if (status === "active") filter.isActive = true;
    if (status === "inactive") filter.isActive = false;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug isActive")
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      products,
      pagination: buildPagination(pagination, total),
    });
  } catch (error) {
    next(error);
  }
};

// All categories, including inactive ones (so they can be re-activated).
const getAdminCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    res.status(200).json({
      categories,
    });
  } catch (error) {
    next(error);
  }
};

// ?page=&limit=&approved=true|false
const getAdminReviews = async (req, res, next) => {
  try {
    const { approved } = req.query;
    const pagination = parsePagination(req.query, {
      defaultLimit: 20,
      maxLimit: 100,
    });

    const filter = {};

    if (approved === "true") filter.isApproved = true;
    if (approved === "false") filter.isApproved = false;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("user", "name email")
        .populate("product", "name slug")
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      Review.countDocuments(filter),
    ]);

    res.status(200).json({
      reviews,
      pagination: buildPagination(pagination, total),
    });
  } catch (error) {
    next(error);
  }
};

const setReviewApproval = async (req, res, next) => {
  try {
    const { isApproved } = req.body;

    if (typeof isApproved !== "boolean") {
      return res.status(400).json({
        message: "isApproved must be true or false",
      });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    res.status(200).json({
      message: isApproved ? "Review approved" : "Review hidden",
      review,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAdminReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getRecentOrders,
  getAdminProducts,
  getAdminCategories,
  getAdminReviews,
  setReviewApproval,
  deleteAdminReview,
};