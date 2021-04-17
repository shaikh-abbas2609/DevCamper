const mongoose = require("mongoose");
const { isURL, isEmail } = require("validator");
const slugify = require("slugify");
const geocoder = require("../utils/geocoder");

const BootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name can't be more than 50 Characters"],
    },
    slug: String,
    description: {
      type: String,
      required: [true, "Please add a Description"],
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    website: {
      type: String,
      validate: [isURL, "Please enter correct URL"],
    },
    phone: {
      type: String,
      maxlength: [20, "Phone Number cannot be more than 20 characters"],
    },
    email: {
      type: String,
      validate: [isEmail, "Please enter correct email"],
    },
    address: {
      type: String,
      required: [true, "Please enter address field"],
    },
    location: {
      // GeoJson
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
      formattedAdress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },
    careers: {
      type: [String],
      required: true,
      enum: [
        "Web Development",
        "Mobile Development",
        "UI/UX",
        "Data Science",
        "Business",
        "Other",
      ],
    },
    averageRating: {
      type: Number,
      min: [1, "Rating must be atleast 1"],
      max: [10, "Rating must be not more than 10"],
    },
    averageCost: {
      type: Number,
    },
    photo: {
      type: String,
      default: "no-photo.jpg",
    },
    housing: {
      type: Boolean,
      default: false,
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssistance: {
      type: Boolean,
      default: false,
    },
    jobGuarantee: {
      type: Boolean,
      default: false,
    },
    acceptGI: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

BootcampSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Geocode : Create location Field
BootcampSchema.pre("save", async function (next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    country: loc[0].countryCode,
    zipcode: loc[0].zipcode,
    formattedAdress: loc[0].formattedAddress,
  };
  // Do not save address in DB
  this.address = undefined;
  next();
});

// Cascade Delete courses after bootcamp deleted
BootcampSchema.pre("remove", async function (next) {
  await this.model("Course").deleteMany({ bootcamp: this._id });
  await this.model("review").deleteMany({ bootcamp: this._id });
  next();
});

// Reverse Populate with virtuals
BootcampSchema.virtual("courses", {
  ref: "Course",
  localField: "_id",
  foreignField: "bootcamp",
  justOne: false,
});

const BootcampModel = mongoose.model("bootcamp", BootcampSchema);

module.exports = BootcampModel;
