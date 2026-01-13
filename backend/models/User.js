const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
    },

        phone: {

          type: String,

          unique: true,

          sparse: true,

        },

        password: { type: String, required: true },

        pushSubscription: { type: Object }, // Store the PushSubscription object here

      },

      { timestamps: true }

    );

module.exports = mongoose.model("User", userSchema);
