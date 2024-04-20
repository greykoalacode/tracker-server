const dotenv = require("dotenv");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path  = require("path");
const app = express();
const mongoose = require("mongoose");

// Import Routes
const authRoute = require("./routes/auth");
const taskRoute = require("./routes/tasks");
const habitRoute = require("./routes/habits");
const exerciseRoute = require("./routes/exercise");
const routineRoute = require("./routes/routine");
const logRoute = require("./routes/log");

dotenv.config();

// Connect to DB
mongoose.connect(process.env.DB_CONN, () => {
  console.log("Connected to db!");
});

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: ["http://localhost:3000", "https://tracker-client-rho.vercel.app"],
    credentials: true,
  })
);
app.use(function (req, res, next) {
  // res.header("Access-Control-Allow-Origin", "tracker-client-rho.vercel.app");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Max-Age", "1800");
  res.header("Access-Control-Allow-Headers", "content-type");
  res.header(
    "Access-Control-Allow-Methods",
    "PUT, POST, GET, DELETE, PATCH, OPTIONS"
  );
  next();
});

// Route Middlewares
app.use("/api/user", authRoute);
app.use("/api/tasks", taskRoute);
app.use("/api/habits", habitRoute);
app.use("/api/exercises", exerciseRoute);
app.use("/api/routines", routineRoute);
app.use("/api/logs", logRoute);

// const __dirname = path.resolve();
  app.get('/', (req, res) => {
    res.send('API is running....')
  });

// app.get("/", (req, res) => {
//   res.send("Hello");
// });

app.listen(process.env.PORT || 3001, () =>
  console.log("Server Up and Running at "+ (process.env.PORT || 3001))
);
