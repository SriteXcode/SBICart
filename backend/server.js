require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors({
  origin: [
    "https://sbicard-p981.onrender.com", 
    "http://localhost:5173", 
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("MONGO Connected successfully");
});

// Init Scheduler
const initScheduler = require("./scheduler");
initScheduler();


app.use("/api/customers", require("./routes/customer.routes"));
app.use("/api/ptps", require("./routes/ptp.routes"));
app.use("/api/auth", require("./routes/auth.routes"));

app.listen(process.env.PORT, () => console.log("Server running on 5000"));
