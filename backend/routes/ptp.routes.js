const express = require("express");
const PTP = require("../models/PTP");
const Customer = require("../models/Customer");
const auth = require("../middleware/auth"); // Assuming you have an auth middleware
const router = express.Router();

router.use(auth); // Protect all PTP routes

// GET all PTPs for the user
router.get("/", async (req, res) => {
  try {
    const ptps = await PTP.find({ user: req.userId }).sort({ ptpDate: 1 });
    res.json(ptps);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST create a new PTP
router.post("/", async (req, res) => {
  try {
    const { type, customerId, name, accountNo, ptpDate } = req.body;
    // type: "existing" | "manual"

    let ptpData = {
      user: req.userId,
      ptpDate,
    };

    if (type === "existing" && customerId) {
      const customer = await Customer.findOne({ _id: customerId, user: req.userId });
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      ptpData.customer = customer._id;
      ptpData.name = customer.name;
      ptpData.accountNo = customer.accountNo;
    } else {
      // Manual
      ptpData.name = name;
      ptpData.accountNo = accountNo;
    }

    const newPTP = await PTP.create(ptpData);
    res.status(201).json(newPTP);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE a PTP
router.delete("/:id", async (req, res) => {
  try {
    await PTP.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.json({ message: "PTP deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
