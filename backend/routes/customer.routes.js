const express = require("express");
const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const auth = require("../middleware/auth");

const router = express.Router();

/* GET customers (search + sort) */
router.get("/", auth, async (req, res) => {
  const { search = "", sort = "newest" } = req.query;

  const query = {
  user: req.user.id,
  isArchived: false,
  $or: [
    { name: new RegExp(search, "i") },
    { accountNo: new RegExp(search, "i") },
    { mobile: new RegExp(search, "i") },
  ],
};


  let sortObj = { createdAt: -1 };
  if (sort === "alpha") sortObj = { name: 1 };
  if (sort === "balance") sortObj = { balance: -1 };

  const data = await Customer.find(query).sort(sortObj);
  res.json(data);
});

/* ADD */
router.post("/", auth, async (req, res) => {
  const customer = await Customer.create({
    ...req.body,
    user: req.user.id,
  });

  res.json(customer);
});


/* UPDATE */
router.put("/:id", auth, async (req, res) => {
  const updated = await Customer.findOneAndUpdate(
  { _id: req.params.id, user: req.user.id },
  req.body,
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
