const express = require("express");
const PTP = require("../models/PTP");
const Customer = require("../models/Customer");
const User = require("../models/User");
const auth = require("../middleware/auth");
const webpush = require("web-push");
const router = express.Router();

// Configure web-push (ensure keys are loaded)
if (process.env.PUBLIC_VAPID_KEY && process.env.PRIVATE_VAPID_KEY) {
    webpush.setVapidDetails(
      "mailto:example@yourdomain.org",
      process.env.PUBLIC_VAPID_KEY,
      process.env.PRIVATE_VAPID_KEY
    );
}

router.use(auth);

// GET all PTPs for the user
router.get("/", async (req, res) => {
  try {
    const ptps = await PTP.find({ user: req.user.id }).sort({ ptpDate: 1 });
    res.json(ptps);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST create a new PTP
router.post("/", async (req, res) => {
  try {
    const { type, customerId, name, accountNo, phone, ptpDate } = req.body;
    
    let ptpData = {
      user: req.user.id,
      ptpDate,
    };

    if (type === "existing" && customerId) {
      const customer = await Customer.findOne({ _id: customerId, user: req.user.id });
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      ptpData.customer = customer._id;
      ptpData.name = customer.name;
      ptpData.accountNo = customer.accountNo;
      ptpData.phone = customer.mobile;
    } else {
      ptpData.name = name;
      ptpData.accountNo = accountNo;
      ptpData.phone = phone;
    }

    const newPTP = await PTP.create(ptpData);
    res.status(201).json(newPTP);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT update PTP status
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const ptp = await PTP.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status },
      { new: true }
    );
    if (!ptp) {
      return res.status(404).json({ message: "PTP not found" });
    }
    res.json(ptp);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE a PTP
router.delete("/:id", async (req, res) => {
  try {
    await PTP.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: "PTP deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// TEST NOTIFICATION
router.post("/test-notification", async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.pushSubscription) {
            return res.status(400).json({ message: "No subscription found" });
        }

        const payload = JSON.stringify({
            title: "Test Notification",
            body: "This is a test notification from SBICart.",
            icon: "/vite.svg"
        });

        await webpush.sendNotification(user.pushSubscription, payload);
        res.json({ message: "Notification sent" });
    } catch (err) {
        console.error("Test Notification Error:", err);
        res.status(500).json({ message: "Failed to send notification" });
    }
});

module.exports = router;
