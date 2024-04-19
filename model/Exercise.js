const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const exerciseSchema = new Schema(
  {
    exerciseID: {
      type: Number,
    },
    bodyPart: {
      type: String,
      required: true,
    },
    equipment: {
      type: String,
      required: true,
    },
    gifUrl: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    target: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Exercise", exerciseSchema);
