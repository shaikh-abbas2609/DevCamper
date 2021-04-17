const express = require("express");
const {
  register,
  login,
  getMe,
  forgotpassword,
  resetPassword,
  updateUserDetails,
  updatePassword,
  logout,
} = require("../controller/authController");
const { protectRoutes } = require("../middlewares/authHandler");
const authRouter = express.Router();

authRouter.post("/register", register);

authRouter.post("/login", login);

authRouter.get("/me", protectRoutes, getMe);

authRouter.get("/logout", protectRoutes, logout);

authRouter.put("/updatedetails", protectRoutes, updateUserDetails);

authRouter.put("/updatepassword", protectRoutes, updatePassword);

authRouter.post("/forgotpassword", forgotpassword);

authRouter.put("/resetpassword/:resettoken", resetPassword);

module.exports = authRouter;
