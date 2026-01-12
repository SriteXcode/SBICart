require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

const allowedOrigins = [
  "https://sbicard-p981.onrender.com",
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.options("*", cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);
mongoose.connection.once("open", () => {
  console.log("MONGO Connected successfully");
});

app.use("/api/customers", require("./routes/customer.routes"));
app.use("/api/auth", require("./routes/auth.routes"));

app.listen(process.env.PORT, () =>
  console.log("Server running on", process.env.PORT)
);
