const express = require("express");
const Routine = require("../model/Routine");
const User = require("../model/User");
const router = express.Router();
const verify = require("./verifyToken");

router
  .route("/")
  .get(verify, async (req, res) => {
    try {
      const routines = await Routine.find({userID: req.user._id}).populate("workouts.exercise");
      return res.send(routines);
    } catch (error) {
      return res.send(error);
    }
  })
  .post(verify, async (req, res) => {
    try {
      const { name, description, workouts } = req.body;
      const existingRoutineWithSameName = await Routine.findOne({ name: name });
      if (existingRoutineWithSameName) {
        return res.status(400).send("Routine already exists");
      }
      const newRoutine = await new Routine({
        name: name,
        description: description,
        workouts: workouts,
        userID: req.user._id,
      }).save();
      const user = await User.findByIdAndUpdate(
        req.user._id,
        {
          $push: {
            routines: newRoutine,
          },
        },
        { new: true }
      ).populate({path: "routines", populate: "workouts.exercise"});
      return res.json(user.routines);
    } catch (error) {
      return res.send(error);
    }
  })
  .delete(verify, async (req, res) => {
    try {
      //   Check if Routines exist first
      const routines = await User.findById(req.user._id);
      // console.log(routines.routines);
      if (routines.routines.length <= 0) {
        return res.status(400).send("No Routines exist for this user.");
      }

      const deleteRoutines = await Routine.deleteMany({ userID: req.user._id });
      if (deleteRoutines.deletedCount === 1) {
        const deleteFromUser = await User.findByIdAndUpdate(req.user._id, {
          $set: { routines: [] },
        });

        if (deleteFromUser) {
          return res.status(200).send("Routines Deleted Successfully");
        }
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
      const routineDoesExist = await Routine.findOne({ _id: id, userID: _id });
      // console.log(routineDoesExist);
      if (!routineDoesExist) {
        return res
          .status(400)
          .send(
            "Routine Does not exist / User does not have the specific routine"
          );
      }

      return res.json(routineDoesExist);
    } catch (error) {
      return res.send(error);
    }
  })
  .put(verify, async (req, res) => {
    try {
      const { id } = req.params;
      const { _id } = req.user;
      const { workouts } = req.body;
      // if filter is there, delete Exercise is done
      if("filter" in req.body){
        const updateRoutine = await Routine.findOneAndUpdate(
          {_id: id, userID: _id},
          {
            $set: { "workouts": workouts}
          },
          {
            new: true
          }
        );
        // console.log(updateRoutine)
      }
      // If id is there
      else if("_id" in workouts){
        const updateExerciseInRoutine = await Routine.findOneAndUpdate(
          {_id: id, userID: _id, "workouts._id": workouts._id},
          {
            $set: { "workouts.$": workouts}
          }
         );
      } 
      else {
        const changedRoutine = await Routine.findOneAndUpdate(
          { _id: id, userID: _id },
          {
            $push: { workouts: workouts },
          }
        )
      }
      // const userRoutines =  await Routine.find({userID: _id }).populate("workouts.exercise");
      const updatedUserRoutines = await User.findOne({_id: _id}).populate({ path: "routines", populate: "workouts.exercise"});
      return res.json(updatedUserRoutines.routines);
    } catch (error) {
      return res.send(error);
    }
  })
  .delete(verify, async (req, res) => {
    try {
      const { id } = req.params;
      const { _id } = req.user;
      const deleteRoutine = await Routine.deleteOne({ _id: id, userID: _id });
      if (deleteRoutine.deletedCount === 1) {
        const removeFromUser = await User.findByIdAndUpdate(
          _id,
          { $pull: { routines: id } },
          { new: true }
        ).populate({path: 'routines',
        populate: 'workouts.exercise'});
        return res.json(removeFromUser.routines);
      }
    } catch (error) {
      return res.send(error);
    }
  });

module.exports = router;
