const express = require("express");
const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
} = require("../controller/reviewsController");
const reviewRoutes = express.Router({ mergeParams: true });
const ReviewModel = require("../models/Review");
const advancedResult = require("../middlewares/advancedResult");
const { protectRoutes, roles } = require("../middlewares/authHandler");

reviewRoutes.get(
  "/",
  advancedResult(ReviewModel, {
    path: "bootcamp",
    select: "name description",
  }),
  getReviews
);

reviewRoutes.post("/", protectRoutes, roles("user", "admin"), addReview);

reviewRoutes.get("/:id", getReview);

reviewRoutes.put("/:id", protectRoutes, roles("user", "admin"), updateReview);

reviewRoutes.delete('/:id', protectRoutes, roles('user','admin'), deleteReview)
module.exports = reviewRoutes;
