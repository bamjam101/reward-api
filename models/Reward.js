const mongoose = require("mongoose");

const RewardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    points: {
      type: Number,
      default: 0,
    },
    lastOnlineTime: {
      type: Date,
      default: Date.now(),
    },
    lastRewardTime: {
      type: Date,
      default: Date.now(),
    },
    streak: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reward", RewardSchema);
