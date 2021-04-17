const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");

// config enviroment variables
dotenv.config({ path: "./config/config.env" });

// Load models
const BootcampModel = require("./models/Bootcamps");
const CourseModel = require("./models/Course");
const UserModel = require("./models/User");
const ReviewModel = require("./models/Review");

// connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

// Read Files
let fileTobeRead;
let Model;
if (process.argv[3] === "-b") {
  fileTobeRead = "bootcamps.json";
  Model = BootcampModel;
} else if (process.argv[3] === "-c") {
  fileTobeRead = "courses.json";
  Model = CourseModel;
} else if (process.argv[3] === "-u") {
  fileTobeRead = "users.json";
  Model = UserModel;
} else if (process.argv[3] === "-r") {
  fileTobeRead = "reviews.json";
  Model = ReviewModel;
}

const fileRead = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/${fileTobeRead}`, "utf-8")
);

// import into DB

const importData = async () => {
  try {
    await Model.create(fileRead);
    console.log("Data Imported ....".green.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await Model.deleteMany();
    console.log("Data Destroyed ....".red.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
}
