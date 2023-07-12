const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      max: 21,
      min: 2,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      max: 50,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      max: 12,
    },
    password: {
      type: String,
      required: true,
      min: 6,
      max: 30,
    },
    interests: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
