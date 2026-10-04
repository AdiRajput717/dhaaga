const express = require("express");

const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cart.controller");

const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// All cart routes require authentication

router.get("/", protect, getCart);

router.post("/items", protect, addToCart);

router.put("/items/:itemId", protect, updateCartItem);

router.delete("/items/:itemId", protect, removeCartItem);

router.delete("/", protect, clearCart);

module.exports = router;