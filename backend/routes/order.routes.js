const express = require("express");

const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/order.controller");

const { protect } = require("../middleware/auth.middleware");
const { admin } = require("../middleware/admin.middleware");

const router = express.Router();

// Customer
router.post("/", protect, createOrder);

router.get("/", protect, getMyOrders);

// Admin
router.get("/admin/all", protect, admin, getAllOrders);

router.put("/admin/:id/status", protect, admin, updateOrderStatus);

// Customer
router.get("/:id", protect, getOrderById);

module.exports = router;