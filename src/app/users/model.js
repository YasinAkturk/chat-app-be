const mongoose = require("mongoose");

const userShema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    mailCode: {
      code: {
        type: String,
        default: null,
      },
      time: {
        type: String,
        default: null,
      },
    },
    verified: {
      type: Boolean,
      default: false,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
  },
  { collection: "users", timestamps: true }
);

userShema.index({ email: 1 }); // email alanında artan sıralı indeks

const user = mongoose.model("users", userShema);

module.exports = user;
