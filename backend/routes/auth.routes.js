const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

/* ================= GET CURRENT USER ================= */
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !password || (!email && !phone)) {
      return res.status(400).json({
        message: "Name, password, and email or phone required",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  const { identifier, password } = req.body;
  // identifier = email OR phone

  if (!identifier || !password) {
    return res.status(400).json({ message: "Credentials required" });
  }

  const user = await User.findOne({
    $or: [{ email: identifier }, { phone: identifier }],
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  });
});

/* ================= PUSH SUBSCRIPTION ================= */
// Note: Ideally this should be in a protected route file or utilize the auth middleware
// For now, we will require the user to send their ID or token.
// Better: Let's assume the frontend sends the token in headers, so we can use the middleware inside the route handler or apply it to this specific route if we import it.
// I will import the auth middleware to secure this route.

router.post("/subscribe", auth, async (req, res) => {
  try {
    const subscription = req.body;
    await User.findByIdAndUpdate(req.user.id, { pushSubscription: subscription });
    res.status(201).json({ message: "Subscription saved" });
  } catch (err) {
    console.error("Subscription Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/unsubscribe", auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { pushSubscription: null });
    res.json({ message: "Unsubscribed successfully" });
  } catch (err) {
    console.error("Unsubscribe Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
