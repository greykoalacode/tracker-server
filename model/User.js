const mongoose = require("mongoose");

const Genders = Object.freeze({
  Male: "male",
  Female: "female",
  Other: "other",
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      min: 6,
      max: 255,
    },
    email: {
      type: String,
      required: true,
      min: 6,
      max: 255,
    },
    gender: {
      type: String,
      enum: Object.values(Genders),
      required: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
      max: 1024,
    },
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    habits: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Habit",
      },
    ],
    routines: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Routine",
      },
    ],
    logs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Log",
      },
    ]
  },
  {
    timestamps: true,
  }
);

Object.assign(userSchema.statics, {
  Genders,
});

module.exports = mongoose.model("User", userSchema);
