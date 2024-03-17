const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    userName: {
      type: String,
      unique: true,
      required: true,
      minLength: 3,
      maxLength: 6,
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
  },
  {
    timestamps: true,
  }
);

module.exports = model("User", userSchema);
