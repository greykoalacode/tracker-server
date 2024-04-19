const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const workoutSchema = new Schema({
  exercise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exercise",
  },
  sets: [
    {
      weight: {
        type: Number,
        required: true,
      },
      reps: {
        type: Number,
        required: true,
      },
    },
  ],
});

const routineSchema = new Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    workouts: [workoutSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Routine", routineSchema);
