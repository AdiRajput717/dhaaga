const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Review = require("../models/Review");
const Category = require("../models/Category");

const getDashboardStats = async (req, res) => {
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
    console.error("Dashboard stats error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const getRecentOrders = async (req, res) => {
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
    console.error("Recent orders error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

module.exports = {
  getDashboardStats,
  getRecentOrders,
};