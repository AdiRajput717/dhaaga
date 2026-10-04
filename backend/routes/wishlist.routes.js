const express = require("express");

const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} = require("../controllers/wishlist.controller");

const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", protect, getWishlist);

router.post("/items", protect, addToWishlist);

router.delete("/items/:productId", protect, removeFromWishlist);

router.delete("/", protect, clearWishlist);

module.exports = router;