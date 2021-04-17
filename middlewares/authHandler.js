const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const UserModel = require("../models/User");

const protectRoutes = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Checking Headers
    token = req.headers.authorization.split(" ")[1];
  }
  // Checking Cookies
  // else if (req.cookies.jwt) {
  //   token = req.cookies.jwt;
  // }

  // Make sure Token exists
  if (!token) {
    return next(new ErrorResponse("Not Authorized to access this route", 401));
  }

  try {
    // Verify Token
    const verified = await jwt.verify(token, process.env.SECRET_FOR_JWT);
    req.user = await UserModel.findById(verified.id);
    next();
  } catch (err) {
    return next(new ErrorResponse("Not Authorized to acess this route", 401));
  }
});

const roles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} cannot access this route`,
          403
        )
      );
    }
    next();
  };
};

module.exports = {
  protectRoutes,
  roles,
};
