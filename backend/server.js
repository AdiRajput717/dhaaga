const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const { validateEnv, getAllowedOrigins } = require("./config/env");
validateEnv();

const connectDB = require("./config/db");
const { ensureBody } = require("./middleware/validate.middleware");
const { notFound, errorHandler } = require("./middleware/error.middleware");

const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const cartRoutes = require("./routes/cart.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const addressRoutes = require("./routes/address.routes");
const orderRoutes = require("./routes/order.routes");
const userRoutes = require("./routes/user.routes");
const reviewRoutes = require("./routes/review.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

app.disable("x-powered-by");

// Needed so req.ip is correct behind a hosting proxy (Render, Railway, etc.)
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients (no Origin header) and listed origins.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "100kb" }));
app.use(ensureBody);
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Dhaaga API is running",
  });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Dhaaga backend running on http://localhost:${PORT}`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;
