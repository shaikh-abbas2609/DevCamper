const asyncHandler = require("../middlewares/asyncHandler");
const BootcampModel = require("../models/Bootcamps");
const ErrorResponse = require("../utils/errorResponse");
const geocoder = require("../utils/geocoder");
const path = require("path");

// @route - GET /api/v1/bootcamps/
//@Access - Public
const get_bootcamp = asyncHandler(async (req, res) => {
  // Sending Response
  res.status(200).json(res.advancedResult);
});

// @route - POST /api/v1/bootcamps/
//@Access - Private
const post_bootcamp = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  // Check for published bootcamps
  const publishedBootcamp = await BootcampModel.findOne({ user: req.user.id });

  if (publishedBootcamp && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `The user with ${req.user.id} has already published a bootcamp`,
        403
      )
    );
  }

  const bootcamp = await BootcampModel.create(req.body);
  res.status(200).json({
    success: true,
    message: "New bootcamp Added",
    data: bootcamp,
  });
});

// @route - GET /api/v1/bootcamps/:id
//@Access - Public
const single_bootcamp = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const bootcamp = await BootcampModel.findById(id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @route - PUT /api/v1/bootcamps/:id
//@Access - Private
const put_bootcamp = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const updatedData = req.body;
  let bootcamp = await BootcampModel.findById(id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `user with ${req.user.id} cannot update this route`,
        401
      )
    );
  }

  bootcamp = await BootcampModel.findByIdAndUpdate(id, updatedData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @route - DELETE /api/v1/bootcamps/:id
//@Access - Private
const delete_bootcamp = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const bootcamp = await BootcampModel.findById(id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `user with ${req.user.id} cannot delete this bootcamp`,
        401
      )
    );
  }

  await bootcamp.remove();
  res.status(200).json({
    success: true,
    message: "Bootcamp Deleted Successfully",
  });
});

// @desc - Upload photo for bootcamp
// @route - PUT /api/v1/bootcamps/:id/photo
//@Access - Private

const bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await BootcampModel.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `user with ${req.user.id} cannot update this route`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse("Please Upload a photo", 400));
  }

  const file = req.files.file;

  // Make sure the file is image
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse("Please upload an image file", 400));
  }

  // Check File Size
  const limit = process.env.IMAGE_UPLOAD_LIMIT;
  if (file.size > limit) {
    return next(
      new ErrorResponse(`please upload an image less than ${limit}`, 400)
    );
  }

  // Create Custom File name
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      return next(
        new ErrorResponse(`Problem with file upload try after sometime`, 500)
      );
    }

    await BootcampModel.findByIdAndUpdate(req.params.id, { photo: file.name });
    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});

// @route - GET /api/v1/bootcamps/radius/:zipcode/:distance
//@Access - Private
const get_bootcamp_in_radius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get latitude and longitude from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // calc Radius using radian
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 ml / 6,378km

  const radius = distance / 3963;
  const bootcamp = await BootcampModel.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamp.length,
    data: bootcamp,
  });
});

module.exports = {
  get_bootcamp,
  post_bootcamp,
  put_bootcamp,
  delete_bootcamp,
  single_bootcamp,
  get_bootcamp_in_radius,
  bootcampPhotoUpload,
};
