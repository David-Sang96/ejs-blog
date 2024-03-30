const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    userName: {
      type: String,
      unique: true,
      required: true,
      minLength: 3,
      maxLength: 15,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 4,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    payment_session_key: {
      type: String,
    },
    resetToken: String,
    tokenExpiration: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = model("User", userSchema);
