const express = require("express");

const {
  createReview,
  getProductReviews,
  getMyReviews,
  updateReview,
  deleteReview,
} = require("../controllers/review.controller");

const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// Public
router.get(
  "/product/:productId",
  getProductReviews
);

// Customer
router.post("/", protect, createReview);

router.get(
  "/my",
  protect,
  getMyReviews
);

router.put(
  "/:id",
  protect,
  updateReview
);

router.delete(
  "/:id",
  protect,
  deleteReview
);

module.exports = router;