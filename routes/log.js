const express = require("express");
const Log = require("../model/Log");
const Routine = require("../model/Routine");
const User = require("../model/User");
const router = express.Router();
const verify = require("./verifyToken");
const dateToNumber = require("../utils");

router
  .route("/")
  .get(verify, async (req, res) => {
    try {
      const user = await User.findById(req.user._id).populate({
        path: "logs",
        populate: "workouts.exercise",
      });
      // const logs = await Log.find({_id: req.user._id}).populate("workouts.exercise");
      return res.send(user.logs);
    } catch (error) {
      return res.send(error);
    }
  })
  .post(verify, async (req, res) => {
    try {
      const { _id } = req.user;
      const { date, description, workouts } = req.body;
      // const modifiedDate = moment(date, "DD-MM-YYYY").format("MM-DD-YYYY");
      const modifiedDate = dateToNumber(date);
      // console.log(date, modifiedDate)
      const existingLog = await Log.findOne({
        userID: _id,
        date: modifiedDate,
      });
      if (existingLog) {
        return res
          .status(405)
          .send("POST request can not be made for PUT request");
      }
      const newLog = await new Log({
        userID: _id,
        date: modifiedDate,
        description: description || "",
        workouts: workouts || [],
      }).save();
      const user = await User.findByIdAndUpdate(
        req.user._id,
        {
          $push: {
            logs: newLog,
          },
        },
        { new: true }
      );
      const logs = await Log.find({ userID: _id }).populate(
        "workouts.exercise"
      );

      return res.json(logs);
    } catch (error) {
      return res.send(error);
    }
  })
  .delete(verify, async (req, res) => {
    try {
      //   Check if Logs exist first

      const { _id } = req.user;
      const user = await User.findById(_id).populate("logs");
      // console.log(user.logs);
      if (user.logs.length <= 0) {
        return res.status(400).send("No Logs exist for this user.");
      }

      const deleteLog = await Log.deleteMany({ userID: _id });
      // console.log(deleteLog);
      if (deleteLog.deletedCount === 1) {
        const deleteFromUser = await User.findByIdAndUpdate(_id, {
          $set: { logs: [] },
        });
        // if (deleteFromUser) {
        return res.status(200).send("Logs Deleted Successfully");
        // }
      }
    } catch (error) {
      return res.send(error);
    }
  });

router
  .route("/:id")
  .get(verify, async (req, res) => {
    try {
      const { _id } = req.user;
      const { id } = req.params;

      const logDoesExist = await Log.findOne({
        _id: id,
        userID: _id,
      }).populate("workouts.exercise");
      if (!logDoesExist) {
        return res
          .status(400)
          .send(
            "Log does not exist / User does not have the specific Log"
          );
      }
      console.log(logDoesExist);
      return res.json(logDoesExist);
    } catch (error) {
      return res.send(error);
    }
  })
  .put(verify, async (req, res) => {
    try {
      const { id } = req.params;
      const { _id } = req.user;
      const { description, workouts } = req.body;
      const logExists = await Log.findOne({
        _id: id,
        userID: _id,
      });
      if (!logExists) {
        return res
          .status(400)
          .send("Log for the particular date / user does not exist");
      }

      if(!"workouts.exercise" in req.body){
        return res.status(400)
        .json({message: "Exercise is not mentioned"});
      }

      // When a person wants to add the exercises in routine to their log right away.
      if ("addRoutine" in req.body) {
        const { routines } = req.body;
        const routinesPresent = await Routine.find({
          _id: { $in: routines },
        }).populate("workouts.exercise");

        const workoutsOfRoutines = routinesPresent.reduce(
          (allworkouts, eachRoutine) => [
            ...allworkouts,
            ...eachRoutine.workouts,
          ],
          []
        );
        // if routine does not exist
        if (!routinesPresent) {
          return res
            .status(400)
            .json({ message: "The Routine does not exist with given Id" });
        }

        // Add them to your log
        const addToLog = await Log.findByIdAndUpdate(
          id,
          { $addToSet: { workouts: workoutsOfRoutines } },
          { new: true }
        );
        const userLogs = await User.findById(_id).populate({
          path: "logs",
          populate: "workouts.exercise",
        });
        return res.json(userLogs.logs);
      }

      // when exercise(s) is/are deleted from the log
      if ("filter" in req.body) {
        const updateLog = await Log.findOneAndUpdate(
          { _id: id, userID: _id, date: modifiedDate },
          {
            $set: { workouts: workouts },
          },
          {
            new: true,
          }
        );
        const updatedUserLogs = await User.findById(_id).populate({
          path: "logs",
          populate: "workouts.exercise",
        });
        return res.json(updatedUserLogs.logs);
      }

      // If id is there
      else if ("_id" in workouts) {
        const updateExerciseInLog = await Log.findOneAndUpdate(
          { _id: id, userID: _id, "workouts._id": workouts._id },
          {
            $set: { "workouts.$": workouts },
          }
        );
        const updatedUserLogs = await User.findById(_id).populate({
          path: "logs",
          populate: "workouts.exercise",
        });
        return res.json(updatedUserLogs.logs);
      } else {
        const changedLog = await Log.findOneAndUpdate(
          { _id: id, userID: _id },
          {
            $addToSet: { workouts: workouts },
          }
        );
        const updatedUserLogs = await User.findById(_id).populate({
          path: "logs",
          populate: "workouts.exercise",
        });
        return res.json(updatedUserLogs.logs);
      }
    } catch (error) {
      return res.send(error);
    }
  })
  .delete(verify, async (req, res) => {
    try {
      const { id } = req.params;
      const { _id } = req.user;
      //   Check log exists
      const log = await Log.findOne({ _id: id, userID: _id });
      // console.log(log);
      if (!log) {
        return res.status(400).send("This Particular Log does not exist");
      }
      const user = await User.findById(_id).populate("logs");
      if (user.logs.length <= 0) {
        return res.status(400).send("The User does not have any log");
      }
      //   Check if user has this particular log
      const particularLog = User.findOne({
        _id: _id,
        logs: { $in: [id] },
      });
      if (!particularLog) {
        return res
          .status(400)
          .send("This particular log of user does not exists");
      }
      //   actual process for deleting a log
      const deleteLog = await Log.deleteOne({ _id: id, userID: _id });
      if (deleteLog.deletedCount === 1) {
        const removeFromUser = await User.findByIdAndUpdate(_id, {
          $pull: { logs: id },
        });
        const updatedLogs = await Log.find({ userID: _id }).populate(
          "workouts.exercise"
        );

        return res.json(updatedLogs);
      }
    } catch (error) {
      return res.send(error);
    }
  });

module.exports = router;
