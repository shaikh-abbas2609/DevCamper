const asyncHandler = require("../middlewares/asyncHandler");
const ReviewModel = require("../models/Review");
const ErrorResponse = require("../utils/errorResponse");
const BootcampModel = require("../models/Bootcamps");

// @desc Get reviews
// @route - GET /api/v1/reviews/
// @route - GET /api/v1/bootcamps/:bootcampId/reviews
//@Access - Public
const getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await ReviewModel.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResult);
  }
});

// @desc Get Single reviews
// @route - GET /api/v1/reviews/:id
//@Access - Public
const getReview = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const review = await ReviewModel.findById(id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!review) {
    return next(new ErrorResponse(`Review with id ${id} doesnt exist`, 404));
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc Add Review
// @route - GET /api/v1/bootcamps/:bootcampId/reviews
//@Access - Private
const addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  const bootcamp = await BootcampModel.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with id of ${req.params.id}`, 404)
    );
  }

  // Checking if the user already reviewed the bootcamp
  const isReviewed = await ReviewModel.find({ user: req.body.user });
  if (isReviewed.length) {
    return next(
      new ErrorResponse("You had already reviewed this bootcamp", 403)
    );
  }

  // Adding the bootcamp
  const review = await ReviewModel.create(req.body);
  console.log(review);
  res.status(201).json({
    success: true,
    data: review,
  });
});

// @desc Update a review
// @route - PUT /api/v1/reviews/:id
//@Access - Private
const updateReview = asyncHandler(async (req, res, next) => {
  let query;
  const id = req.params.id;
  const review = await ReviewModel.findById(id);

  if (!review) {
    return next(new ErrorResponse(`No Course with id ${id}`));
  }

  console.log(req.user.id);
  console.log(review.user.toString());

  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `user with ${req.user.id} not authorize to update review in following bootcamp`,
        401
      )
    );
  }

  query = ReviewModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  const updatedReview = await query;

  res.status(200).json({
    success: true,
    data: updatedReview,
  });
});

// @desc delete a review
// @route DELETE api/v1/reviews/:id
// @access Private

const deleteReview = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const review = await ReviewModel.findById(id);

  if (!review) {
    return next(new ErrorResponse("No review found", 404));
  }

  if (req.user.id !== review.user.toString() && req.user.role !== "admin") {
    return next(new ErrorResponse("You cannot delete this review", 403));
  }

  await ReviewModel.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Review Deleted",
  });
});

module.exports = {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
};
