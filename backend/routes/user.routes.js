const express = require("express");

const {
  getAllUsers,
  getUserById,
  updateUserRole,
} = require("../controllers/user.controller");

const { protect } = require("../middleware/auth.middleware");
const { admin } = require("../middleware/admin.middleware");

const router = express.Router();

router.get(
  "/",
  protect,
  admin,
  getAllUsers
);

router.get(
  "/:id",
  protect,
  admin,
  getUserById
);

router.put(
  "/:id/role",
  protect,
  admin,
  updateUserRole
);

module.exports = router;