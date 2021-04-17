const express = require("express");
const {
  getUsers,
  createUser,
  getSingleUser,
  updateUser,
  deleteUser,
} = require("../controller/userController");
const adminRoutes = express.Router();
const UserModel = require("../models/User");
const advancedResult = require("../middlewares/advancedResult");
const { protectRoutes, roles } = require("../middlewares/authHandler");

adminRoutes.use(protectRoutes);
adminRoutes.use(roles("admin"));

adminRoutes.get("/", advancedResult(UserModel), getUsers);

adminRoutes.post("/", createUser);

adminRoutes.route("/:id").get(getSingleUser).put(updateUser).delete(deleteUser);

module.exports = adminRoutes;
