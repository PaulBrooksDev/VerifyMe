const mongoose = require("mongoose");
const options = { timestamps: true };

const userSchema = new mongoose.Schema(
  {
    discordId: {
      type: String,
      required: true,
    },

    discordUsername: {
      type: String,
      required: true,
    },

    twitterId: {
      type: String,
    },

    twitterUsername: {
      type: String,
    },

    walletAddress: {
      type: String,
    },

    currentStep: {
      type: Number,
      required: true,
    },

    isSignUpComplete: {
      type: Boolean,
      default: false,
      required: true,
    },

    inviteCode: {
      type: String,
      default: "",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    uuid: {
      type: String,
      required: true,
    },
  },
  options
);

const User = mongoose.model("user", userSchema);

module.exports = User;
