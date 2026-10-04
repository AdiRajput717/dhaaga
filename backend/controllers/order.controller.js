const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Address = require("../models/Address");

const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);

  return `DHAAGA-${timestamp}-${random}`;
};

const createOrder = async (req, res) => {
  try {
    const { addressId, paymentMethod } = req.body;

    if (!addressId || !paymentMethod) {
      return res.status(400).json({
        message: "Address and payment method are required",
      });
    }

    if (!["cod", "razorpay"].includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    const cart = await Cart.findOne({
      user: req.user.userId,
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    const address = await Address.findOne({
      _id: addressId,
      user: req.user.userId,
    });

    if (!address) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    let subtotal = 0;

    const orderItems = cart.items.map((item) => {
      const product = item.product;

      const variant = product.variants.find(
        (variant) =>
          variant.size === item.size &&
          variant.color === item.color
      );

      if (!variant) {
        throw new Error(
          `Variant unavailable for ${product.name}`
        );
      }

      if (variant.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${product.name}`
        );
      }

      const itemPrice = product.price;

      subtotal += itemPrice * item.quantity;

      return {
        product: product._id,
        productName: product.name,
        productImage: product.images?.[0] || "",
        size: item.size,
        color: item.color,
        price: itemPrice,
        quantity: item.quantity,
      };
    });

    const shippingFee = subtotal >= 1999 ? 0 : 99;

    const totalAmount = subtotal + shippingFee;

    const order = await Order.create({
      user: req.user.userId,

      items: orderItems,

      shippingAddress: {
        fullName: address.fullName,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: address.country,
      },

      subtotal,
      shippingFee,
      totalAmount,

      paymentMethod,

      orderNumber: generateOrderNumber(),
    });

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    res.status(500).json({
      message: error.message || "Something went wrong",
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.userId,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      orders,
    });
  } catch (error) {
    console.error("Get all orders error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.orderStatus = orderStatus;

    await order.save();

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};