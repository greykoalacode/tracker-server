const express = require("express");
const router = express.Router();
const verify = require("./verifyToken");
const Exercise = require("../model/Exercise");

router
  .route("/")
  .get(verify, async (req, res) => {
    try {
      const exercises = await Exercise.find();
      return res.json(exercises);
    } catch (error) {
      return res.status(400).send(error);
    }
  })
  .post(verify, async (req, res) => {
    try {
      const { name, target, bodyPart, gifUrl, exerciseID, equipment } =
        req.body;
      const exerciseExists = await Exercise.findOne({ name: name });

      if (exerciseExists)
        return res.status(400).send("Exercise already exists!");

      const exercise = new Exercise({
        name: name,
        target: target,
        bodyPart: bodyPart,
        gifUrl: gifUrl,
        exerciseID: exerciseID,
        equipment: equipment,
      });

      const savedExercise = await exercise.save();
      return res.json(savedExercise);
    } catch (error) {
      res.status(400).send(error);
    }
  });

router.route("/:id").get(verify, async (req, res) => {
  try {
    const { id } = req.params;
    const exercise = await Exercise.findById(id);
    return res.json(exercise);
  } catch (error) {
    return res.status(404).send(error);
  }
});

module.exports = router;
