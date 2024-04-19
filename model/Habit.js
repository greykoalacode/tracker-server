const mongoose = require("mongoose");
const moment = require("moment");
const Schema = mongoose.Schema;

const habitSchema = new Schema(
  {
    userID: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
      min: 3,
    },
    description: {
      type: String,
    },
    progress: [
      {
        date: {
          type: Date,
          required: true,
        },
        status: {
          type: Boolean,
          required: true,
          default: false,
        },
      },
    ],
  },
  { timestamps: true }
);

habitSchema.pre("save", function (next) {
  try {
    let progress = [];
    for (let index = 0; index < 21; index++) {
      progress.push({
        date: Number(new Date(moment().add(index, "days").format("L"))),
        status: false,
      });
    }
    this.progress = progress;
    return next();
  } catch (error) {
    return next(error);
  }
});


module.exports = mongoose.model("Habit", habitSchema);
