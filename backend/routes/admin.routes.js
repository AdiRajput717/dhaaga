const express = require("express");

const {
  getDashboardStats,
  getRecentOrders,
} = require("../controllers/admin.controller");

const { protect } = require("../middleware/auth.middleware");
const { admin } = require("../middleware/admin.middleware");

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  admin,
  getDashboardStats
);

router.get(
  "/recent-orders",
  protect,
  admin,
  getRecentOrders
);

module.exports = router;