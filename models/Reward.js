const mongoose = require("mongoose");

const RewardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    points: {
      type: Number,
    },
    lastOnline: {
      type: Date,
      default: Date.now(),
    },
    streak: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reward", RewardSchema);
