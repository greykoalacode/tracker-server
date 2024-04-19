const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Task = require("../model/Task");
const User = require("../model/User");
const verify = require("./verifyToken");
// const cors = require('./cors');

router
  .route("/")
  .post(verify, async (req, res) => {
    try {
      const newtask = await new Task({
        userID: req.user._id,
        ...req.body,
      }).save();
      // console.log(req.user._id)
      const user = await User.findByIdAndUpdate(
        req.user._id,
        {
          $push: {
            tasks: newtask,
          },
        },
        { new: true }
      ).populate("tasks");
      // user.tasks = task;

      return res.json(user.tasks);
    } catch (error) {
      return res.send(error);
    }
  })
  .get(verify, async (req, res) => {
    try {
      const user = await User.findById(req.user._id).populate("tasks");
      return res.json(user.tasks);
    } catch (error) {
      return res.send(error);
    }
  })
  .delete(verify, async (req, res) => {
    try {
      const userHasTasks = await User.findById(req.user._id);
      if (userHasTasks.tasks.length <= 0) {
        return res.status(400).send("No tasks exist for this user.");
      }

      const tasks = await Task.deleteMany({ userID: req.user._id });
      const updateUser = await User.findByIdAndUpdate(req.user._id, {
        $set: { tasks: [] },
      });
      if (updateUser) {
        return res.status(200).send("Tasks deleted Successfully");
      }
    } catch (error) {
      return res.send(error);
    }
  });
// .put("/", verify, async (req, res) => {
//     try {

//     } catch (error) {

//     }
// })

router
  .route("/:id")
  .get(verify, async (req, res) => {
    try {
      const { id } = req.params;
      const task = await Task.findById(id);
      return res.json(task);
    } catch (error) {
      return res.send(error);
    }
  })
  .put(verify, async (req, res) => {
    try {
      const task = await Task.findOneAndUpdate(
        {
          _id: req.params.id,
        },
        { $set: { completed: req.body.completed } },
        { new: true }
      );
      const user = await User.findById(req.user._id).populate("tasks");
      return res.json(user.tasks);
    } catch (error) {
      return res.send(error);
    }
  })
  .delete(verify, async (req, res) => {
    try {
      const { id } = req.params;
      const { _id } = req.user;
      // const task = await Task.findOne({ _id: id });
      // userID: _id
      const taskDeleted = await Task.deleteOne({ _id: id, userID: _id });
      // console.log(taskDeleted);
      if (taskDeleted.deletedCount === 1) {
        const user = await User.findByIdAndUpdate(
          _id,
          {
            $pull: { tasks: id },
          },
          { new: true }
        ).populate("tasks");
        // console.log(user);

        return res.json(user.tasks);
      }
      // const { id } = req.params;
      // const { _id } = req.user;
      // const habitDeleted = await Habit.deleteOne({ _id: id, userID: _id });
      // if (habitDeleted.deletedCount === 1) {
      //   const user = await User.findByIdAndUpdate(
      //     req.user._id,
      //     {
      //       $pull: { habits: id },
      //     },
      //     { new: true }
      //   ).populate("habits");
      //   return res.json(user.habits);
      // }
    } catch (error) {
      return res.send(error);
    }
  });

module.exports = router;
