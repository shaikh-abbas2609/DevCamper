const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/asyncHandler");
const UserModel = require("../models/User");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// @desc -  Register User
// @route -  GET /api/v1/auth/register
// @acess -  Public

const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await UserModel.create({
    name,
    email,
    password,
    role,
  });

  sendTokenResponse(user, 200, res);
});

// @desc -  Login User
// @route -  GET /api/v1/auth/login
// @acess -  Public

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Please enter correct email", 401));
  }

  const matched = await user.comparePassword(password);

  if (!matched) {
    return next(new ErrorResponse(`Please enter correct password`, 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc -  Get current login User
// @route -  GET /api/v1/auth/me
// @acess -  Private

const getMe = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findById(req.user.id);
  res.status(200).json({
    sucess: true,
    data: user,
  });
});

// @desc -   Log user Out / clear cookie
// @route -  GET /api/v1/auth/logout
// @acess -  Private
const logout = asyncHandler(async (req, res, next) => {
  // res.cookie("jwt", "none", {
  //   expires: new Date(Date.now() + 10 * 1000),
  //   httpOnly: true,
  // });
  res.token = "none";

  res.status(200).json({
    sucess: true,
  });
});

// @desc -   Update user details
// @route -  PUT /api/v1/auth/updatedetails
// @acess -  Private

const updateUserDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await UserModel.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new ErrorResponse("User doesnt exist", 404));
  }
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc -   Update user password
// @route -  PUT /api/v1/auth/updatepassword
// @acess -  Private
const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findById(req.user.id).select("+password");

  if (!user) {
    return next(new ErrorResponse("No user Found", 404));
  }

  const matchPass = await user.comparePassword(req.body.currentpassword);

  if (!matchPass) {
    return next(new ErrorResponse("Incorrect Password", 401));
  }

  user.password = req.body.newpassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc -  Forgot password
// @route -  GET /api/v1/auth/forgotpassword
// @acess -  Public

const forgotpassword = asyncHandler(async (req, res, next) => {
  const email = req.body.email;
  const user = await UserModel.findOne({ email });

  if (!user) {
    return next(new ErrorResponse(`No user with email ${email}`, 404));
  }

  // Get Reset Token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;
  const message = `If you requested for password reset link kindly make a put request to \n\n ${resetURL}
    \n\n if you didn't kindly ignore this message`;

  try {
    await sendEmail({
      email: user.email,
      subject: "password reset token",
      message,
    });

    res.status(200).json({
      sucess: true,
      message: "Reset Link has been sent !",
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.save({ validateBeforeSave: false });
    return next(new ErrorResponse(`Email cannot be sent`, 500));
  }
});

// @desc Reset Password
// @route PUT /api/v1/auth/resetpassword/:resettoken
// @acess PUBLIC

const resetPassword = asyncHandler(async (req, res, next) => {
  // Get Hashed Token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await UserModel.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse(`Invalid Token`, 400));
  }

  // set new Password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendTokenResponse(user, 200, res);
});

const sendTokenResponse = (user, status, res) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 24 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(status).cookie("jwt", token, options).json({
    success: true,
    token,
  });
};

module.exports = {
  register,
  login,
  getMe,
  forgotpassword,
  resetPassword,
  updateUserDetails,
  updatePassword,
  logout,
};
