const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Please add title for the review"],
      maxlength: 100,
    },
    text: {
      type: String,
      required: [true, "Please add some text"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 10,
      required: [true, "Please add rating between 1-10"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: true,
    },
    bootcamp: {
      type: mongoose.Schema.ObjectId,
      ref: "bootcamp",
      required: true,
    },
  },
  { timestamps: true }
);

// Static Method to get average rating and save
reviewSchema.statics.getAverageRating = async function (bootcampId) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: "$bootcamp",
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  try {
    await this.model("bootcamp").findByIdAndUpdate(bootcampId, {
      averageRating: obj[0].averageRating,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call Get Average Cost After Save
reviewSchema.post("save", function () {
  this.constructor.getAverageRating(this.bootcamp);
});

// Preventing User from giving more than on bootcamp
// reviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

const ReviewModel = mongoose.model("review", reviewSchema);

module.exports = ReviewModel;
