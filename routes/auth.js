const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const verify = require("./verifyToken");

const { registerValidation, loginValidation } = require("../validation");

// router.post('/token', (req, res) => {

// });

router.post("/register", async (req, res) => {
  try {
    const { name, email, gender, password } = req.body;

    const { error } = registerValidation(req.body);
    if (error) {
      // console.log(error, req.body);
      return res.status(400).send(error.details);
    }

    // Check if user is already in database
    const emailExist = await User.findOne({ email: email });

    if (emailExist) return res.status(400).send("Email already exists!");

    // Hash Passwords
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new User
    const user = new User({
      name: name,
      email: email,
      gender: gender,
      password: hashedPassword,
    });

    const savedUser = await user.save();
    res.send({ user: savedUser._id });
  } catch (err) {
    console.error(err);
    res.status(400).send(err);
  }
});

router.post("/login", async (req, res) => {
  // Destructure Data
  const { email, password } = req.body;

  // Validate data
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details);

  // Checking if email exists
  const user = await User.findOne({ email: email })
  .populate("tasks")
  .populate("habits")
  .populate({
    path: 'routines',
    populate: 'workouts.exercise'
  })
  .populate({
    path: "logs",
    populate: 'workouts.exercise'
  });

  if (!user) return res.status(400).send("User does not exist");

  // Check Password
  const validPass = await bcrypt.compare(password, user.password);

  // Invalid Password
  if (!validPass) return res.status(400).send("Invalid password!");

  // Create and Assign Token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
    expiresIn: "1h",
  });

  
  // console.log(process.env.NODE_ENV)

  // set cookie via header
  // res.setHeader('Set-Cookie', `token=${token}`);
  // res.cookie("token", token, {
  //   path: "/",
  // });
  // httpOnly: true,
  // sameSite: "none",
  // secure: process.env.NODE_ENV === "production",
  // console.log(process.env.NODE_ENV);
  // process.env.NODE_ENV === 'production'
  //  httpOnly: true

  res.cookie("token",token, {
    expires: new Date(Date.now() + 30* 60000),
    secure: true,
    // path: "/",
    domain: process.env.CLIENT_URL || "localhost",
    httpOnly: true,
    sameSite: "none"
  });
  // .setHeader('Set-Cookie', `token=${token}`)
  return res.json({
    id: user._id,
    name: user.name,
    habits: user.habits,
    tasks: user.tasks,
    workouts: user.workouts,
    routines: user.routines,
    logs: user.logs,
  });

  // Success
  // res.send('Success Login!');
});

router.get("/logout", function (req, res) {

  if (!req.cookies["token"]) {
    return res.status(401).send("Not Logged In");
  }
  res.clearCookie("token", {
    // path: "/",
    httpOnly: true,
    sameSite: "none",
    domain: process.env.CLIENT_URL || "localhost",
    secure: true,
  });

  return res.send("Logout Successful");
});

router.get("/info", verify, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .sort({"logs.date": 1})
      .populate("tasks")
      .populate("habits")
      .populate({
        path: 'routines',
        populate: 'workouts.exercise'
      })
      .populate({
        path: "logs",
        populate: 'workouts.exercise'
      });

    if (!user) {
      return res.status(400).send("Not Found");
    } else {
      const sendUserdets = ({ name, gender, habits, tasks, routines, logs }) => ({
        name,
        gender,
        habits,
        tasks,
        routines, 
        logs
      });
      return res.send(sendUserdets(user));
    }
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
