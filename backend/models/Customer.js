const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: { type: String, required: true },
    accountNo: String,
    mobile: String,
    balance: Number,
    cd: String,
    address: String,
    pincode: String,
    todaysVisit: { type: Boolean, default: false },
    cycleDate: Date,
    status: { type: String, default: "Active" },
    review: String,
    dueAmount: Number,
    exDayAmount: Number,
    notes: String,
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
