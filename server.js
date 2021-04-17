const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const colors = require("colors");
const fileupload = require("express-fileupload");
const path = require("path");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const ratelimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");

//Setting the Config File
dotenv.config({ path: "./config/config.env" });
const app = express();

// Parsing the json
app.use(express.json());

// Setting the Cookies
app.use(cookieParser());

// Setting the Routes
const bootcampRoutes = require("./routes/bootcamps");
const courseRoutes = require("./routes/courses");
const authRoutes = require("./routes/auth");
const errorHandler = require("./middlewares/error");
const adminRoutes = require("./routes/users");
const reviewRoutes = require("./routes/reviews");

// File Uploads
app.use(fileupload());

// Use Static Folder
app.use(express.static(path.join(__dirname, "public")));

// Sanitizing requests
app.use(mongoSanitize());

// Securing Headers
app.use(helmet());

// Preventing Cross site scripting
app.use(xss());

// Preventing http parameter pollution
app.use(hpp());

// Rate limiting
const limiter = ratelimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});

app.use(limiter);

// Cors
app.use(cors());

// Handling Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/bootcamps", bootcampRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/users", adminRoutes);
app.use("/api/v1/reviews", reviewRoutes);

// Error Handling Middleware
app.use(errorHandler);

// connecting to Database and Listening on port
const PORT = process.env.PORT || 5000;

connectDB();

const server = app.listen(
  PORT,
  console.log(
    `Server running on port ${PORT} in ${process.env.NODE_ENV} mode`.bold
      .underline.cyan
  )
);

// Handle unhandled Promise Rejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.strikethrough.red);
  server.close(() => {
    process.exit(1);
  });
});
