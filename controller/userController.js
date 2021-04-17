const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/asyncHandler");
const UserModel = require("../models/User");

// @desc Get all users
// @route GET api/v1/users
// @access Private/admin

const getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResult);
});

// @desc Get Single users
// @route GET api/v1/users/:id
// @access Private/admin

const getSingleUser = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findById(req.params.id);

  res.status(200).json({
    sucess: true,
    data: user,
  });
});

// @desc Create User
// @route POST api/v1/users/:id
// @access Private/admin

const createUser = asyncHandler(async (req, res, next) => {
  const user = await UserModel.create(req.body);

  res.status(201).json({
    sucess: true,
    data: user,
  });
});

// @desc  Update User
// @route PUT api/v1/users/:id
// @access Private/admin

const updateUser = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    sucess: true,
    data: user,
  });
});

// @desc Delete users
// @route DELETE api/v1/users/:id
// @access Private/admin

const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findByIdAndDelete(req.params.id);

  res.status(200).json({
    sucess: true,
    message: "User Deleted",
  });
});

module.exports = {
  getSingleUser,
  getUsers,
  updateUser,
  createUser,
  deleteUser,
};
