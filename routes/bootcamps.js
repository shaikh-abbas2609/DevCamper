const express = require("express");
const {
  get_bootcamp,
  single_bootcamp,
  post_bootcamp,
  put_bootcamp,
  delete_bootcamp,
  get_bootcamp_in_radius,
  bootcampPhotoUpload,
} = require("../controller/bootcampController");

const advancedResult = require("../middlewares/advancedResult");
const { protectRoutes, roles } = require("../middlewares/authHandler");
const BootcampModel = require("../models/Bootcamps");
const ReviewModel = require("../models/Review");

// Include other resource router
const courseRoutes = require("./courses");
const reviewRoutes = require("./reviews");

const bootcampRoutes = express.Router();

// Re-route into other resource router
bootcampRoutes.use("/:bootcampId/courses", courseRoutes);

bootcampRoutes.use("/:bootcampId/reviews", reviewRoutes);

bootcampRoutes.get("/", advancedResult(BootcampModel, "courses"), get_bootcamp);

bootcampRoutes.get("/:id", single_bootcamp);

bootcampRoutes.post(
  "/",
  protectRoutes,
  roles("publisher", "admin"),
  post_bootcamp
);

bootcampRoutes.put(
  "/:id",
  protectRoutes,
  roles("publisher", "admin"),
  put_bootcamp
);

bootcampRoutes.put(
  "/:id/photo",
  protectRoutes,
  roles("publisher", "admin"),
  bootcampPhotoUpload
);

bootcampRoutes.delete(
  "/:id",
  protectRoutes,
  roles("publisher", "admin"),
  delete_bootcamp
);

bootcampRoutes.get("/radius/:zipcode/:distance", get_bootcamp_in_radius);

module.exports = bootcampRoutes;
