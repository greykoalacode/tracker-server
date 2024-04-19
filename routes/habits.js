const express = require("express");
const router = express.Router();
const verify = require("./verifyToken");
const Habit = require("../model/Habit");
const User = require("../model/User");
const dateToNumber = require("../utils");
// const dateToNumber = require("../utils");

// const cors = require('./cors');
// const dateToNumber = (date) =>
//   Number(new Date(moment(date, "DD-MM-YYYY").format("MM-DD-YYYY")));

router
  .route("/")
  .get(verify, async (req, res) => {
    try {
      const user = await User.findById(req.user._id).populate("habits");
      return res.json(user.habits);
    } catch (error) {
      return res.send(error);
    }
  })
  .post(verify, async (req, res) => {
    try {
      // Check for existing habit
      const existinguser = await User.findById(req.user._id);
      const habitfound = existinguser.habits.some(
        (el) => el.name === req.body.name
      );
      if (habitfound) {
        return res.status(400).send("Habit Already Exists");
      }
      // If Habit not found
      const newHabit = await new Habit({
        userID: req.user._id,
        ...req.body,
      }).save();
      // console.log(req.user._id)
      const user = await User.findByIdAndUpdate(
        req.user._id,
        {
          $push: {
            habits: newHabit,
          },
        },
        { new: true }
      ).populate("habits");
      return res.json(user.habits);
    } catch (error) {
      return res.send(error);
    }
  })
  .delete(verify, async (req, res) => {
    try {
      // Check if Habits exist in first place
      const user = await User.findById(req.user._id);
      if (user.habits.length === 0) {
        return res.status(400).send("No Habits exist for this user");
      }

      // Rest case
      const newhabit = await Habit.deleteMany({ userID: req.user._id });
      const userDeletedHabits = await User.findByIdAndUpdate(req.user._id, {
        $set: { habits: [] },
      });

      if (userDeletedHabits) {
        return res.status(200).send("Habits Deleted Successfully");
      }
    } catch (error) {
      return res.send(error);
    }
  });

router
  .route("/:id")
  .get(verify, async (req, res) => {
    try {
      const { id } = req.params;
      const habit = await Habit.findById(id);
      if (habit.userID !== req.user._id) {
        return res.status(404).send("Habit not found");
      }
      return res.json(habit);
    } catch (error) {
      return res.send(error);
    }
  })
  .put(verify, async (req, res) => {
    try {
      const { date, status } = req.body;
      const { _id } = req.user;
      const { id } = req.params;
      const newDate = dateToNumber(date);
      // console.log(newDate, date, new Date(newDate));
      const habitExists = await Habit.findById(id);
      if (habitExists) {
        const habit = await Habit.findOneAndUpdate(
          {
            _id: id,
            "progress.date": dateToNumber(date),
            userID: _id,
          },
          {
            $set: { "progress.$.status": status },
          },
          { new: true }
        );
        if (!habit) {
          const newHabit = await Habit.findOneAndUpdate(
            {
              _id: id,
              userID: _id,
            },
            {
              $push: {
                progress: {
                  date: dateToNumber(date),
                  status: status,
                },
              },
            },
            {
              new: true,
            }
          );
          return res.json(newHabit);
        }
        return res.json(habit);
      }

      return res.status(404).send("Habit does not exist");
      // const habits = await Habit.findOne({
      //   _id: id,
      //   "progress.$.date": moment(req.body.date, "DD-MM-YYYY").format(
      //     "MM-DD-YYYY"
      //   ),
      //   userID: _id,
      // });
      // console.log(req.body.date, moment(req.body.date).format("MM-DD-YYYY"));
      // console.log(habit);

      // const user = await User.findById(req.user._id).populate("habits");
      // console.log(req.body.status, habit, JSON.stringify(user.habits));
    } catch (error) {
      return res.send(error);
    }
  })
  .delete(verify, async (req, res) => {
    try {
      const { id } = req.params;
      const { _id } = req.user;
      const habitDeleted = await Habit.deleteOne({ _id: id, userID: _id });
      if (habitDeleted.deletedCount === 1) {
        const user = await User.findByIdAndUpdate(
          req.user._id,
          {
            $pull: { habits: id },
          },
          { new: true }
        ).populate("habits");
        return res.json(user.habits);
      }
    } catch (error) {
      return res.send(error);
    }
  });
module.exports = router;
