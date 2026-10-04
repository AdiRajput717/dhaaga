const Review = require("../models/Review");
const Order = require("../models/Order");

const createReview = async (req, res) => {
  try {
    const {
      productId,
      orderId,
      rating,
      comment,
    } = req.body;

    if (
      !productId ||
      !orderId ||
      !rating ||
      !comment
    ) {
      return res.status(400).json({
        message: "Product, order, rating and comment are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.orderStatus !== "delivered") {
      return res.status(400).json({
        message: "You can review a product after delivery",
      });
    }

    const purchasedItem = order.items.find(
      (item) =>
        item.product.toString() === productId
    );

    if (!purchasedItem) {
      return res.status(403).json({
        message: "You can only review products you purchased",
      });
    }

    const existingReview = await Review.findOne({
      user: req.user.userId,
      product: productId,
    });

    if (existingReview) {
      return res.status(409).json({
        message: "You have already reviewed this product",
      });
    }

    const review = await Review.create({
      user: req.user.userId,
      product: productId,
      order: orderId,
      rating,
      comment,
      verifiedPurchase: true,
    });

    res.status(201).json({
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    console.error("Create review error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
      isApproved: true,
    })
      .populate("user", "name")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      reviews,
    });
  } catch (error) {
    console.error("Get product reviews error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      user: req.user.userId,
    })
      .populate("product", "name slug images")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      reviews,
    });
  } catch (error) {
    console.error("Get my reviews error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    const { rating, comment } = req.body;

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          message: "Rating must be between 1 and 5",
        });
      }

      review.rating = rating;
    }

    if (comment !== undefined) {
      review.comment = comment;
    }

    await review.save();

    res.status(200).json({
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    console.error("Update review error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

module.exports = {
  createReview,
  getProductReviews,
  getMyReviews,
  updateReview,
  deleteReview,
};