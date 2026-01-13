const express = require("express");
const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const auth = require("../middleware/auth");

const router = express.Router();

const extractPincode = (data) => {
  if (data.address && (!data.pincode || data.pincode.trim() === "")) {
    const match = data.address.match(/\b\d{6}\b/);
    if (match) {
      data.pincode = match[0];
      // Optional: remove pincode from address
      data.address = data.address.replace(match[0], "").replace(/,\s*,/g, ",").trim();
      // Clean up trailing commas or spaces
      if (data.address.endsWith(",")) data.address = data.address.slice(0, -1).trim();
    }
  }
  return data;
};

/* GET customers (search + sort) */
router.get("/", auth, async (req, res) => {
  const { search = "", sort = "newest", todaysVisit, pincode } = req.query;

  const query = {
    user: req.user.id,
    isArchived: false,
    $or: [
      { name: new RegExp(search, "i") },
      { accountNo: new RegExp(search, "i") },
      { mobile: new RegExp(search, "i") },
      { pincode: new RegExp(search, "i") },
      { address: new RegExp(search, "i") }, // also search in address text
    ],
  };

  if (pincode) {
    query.pincode = pincode;
  }

  if (todaysVisit === "true") {
    query.todaysVisit = true;
  }

  let sortObj = { createdAt: -1 };
  if (sort === "alpha") sortObj = { name: 1 };
  if (sort === "balance") sortObj = { balance: -1 };

  const data = await Customer.find(query).sort(sortObj);
  res.json(data);
});

/* GET unique pincodes */
router.get("/pincodes", auth, async (req, res) => {
  try {
    const pincodes = await Customer.distinct("pincode", { 
      user: req.user.id, 
      isArchived: false,
      pincode: { $ne: null } // exclude nulls
    });
    // Filter out empty strings if any and sort
    const cleanPincodes = pincodes.filter(p => p && p.trim() !== "").sort();
    res.json(cleanPincodes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching pincodes" });
  }
});

/* ADD */
router.post("/", auth, async (req, res) => {
  const data = extractPincode({ ...req.body });
  const customer = await Customer.create({
    ...data,
    user: req.user.id,
  });

  res.json(customer);
});

/* BULK ADD */
router.post("/bulk", auth, async (req, res) => {
  try {
    const customers = req.body.map(c => {
      const cleaned = extractPincode({ ...c });
      return {
        ...cleaned,
        user: req.user.id
      };
    });
    
    // Use insertMany for bulk creation
    const created = await Customer.insertMany(customers);
    res.json(created);
  } catch (err) {
    console.error("Bulk upload error:", err);
    res.status(500).json({ message: "Error uploading customers" });
  }
});


/* UPDATE */
router.put("/:id", auth, async (req, res) => {
  const data = extractPincode({ ...req.body });
  const updated = await Customer.findOneAndUpdate(
  { _id: req.params.id, user: req.user.id },
  data,
  { new: true }
);

if (!updated) {
  return res.status(404).json({ message: "Customer not found" });
}

res.json(updated);

});

/* ARCHIVE */
router.delete("/:id", auth, async (req, res) => {
  await Customer.findOneAndUpdate(
  { _id: req.params.id, user: req.user.id },
  { isArchived: true }
);

});

/* DASHBOARD STATS */
router.get("/stats", auth, async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments({
      user: req.user.id,
      isArchived: false,
    });

    const totalBalanceAgg = await Customer.aggregate([
      { 
        $match: { 
          user: new mongoose.Types.ObjectId(req.user.id), 
          isArchived: false 
        } 
      },
      { $group: { _id: null, total: { $sum: "$balance" } } },
    ]);

    res.json({
      totalCustomers,
      totalBalance: totalBalanceAgg[0]?.total || 0
    });
  } catch (err) {
    console.error("STATS ERROR:", err);
    res.status(500).json({ message: "Server error fetching stats" });
  }
});

router.get("/export/csv", auth, async (req, res) => {
  const customers = await Customer.find({ isArchived: false });

  const csv = [
    "Name,Account,Mobile,Balance,CD,Address,Cycle Date,Status,Review,Due Amount,Ex Day Amount,Notes",
    ...customers.map(
      c =>
        `${c.name},${c.accountNo},${c.mobile},${c.balance},${c.cd || ""},${c.address || ""},${c.cycleDate || ""},${c.status || ""},${c.review || ""},${c.dueAmount || 0},${c.exDayAmount || 0},${c.notes || ""}`
    )
  ].join("\n");

  res.header("Content-Type", "text/csv");
  res.attachment("customers.csv");
  res.send(csv);
});

module.exports = router;
