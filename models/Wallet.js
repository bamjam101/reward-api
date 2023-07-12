const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    points: {
      type: Number,
      default: 10,
    },
    lastSeen: {
      type: Date,
      default: new Date(),
    },
    lastReward: {
      type: Date,
      default: new Date(),
    },
    streak: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wallet", WalletSchema);
