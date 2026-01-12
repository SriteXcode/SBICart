require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("MONGO Connected successfully");
});


app.use("/api/customers", require("./routes/customer.routes"));
app.use("/api/auth", require("./routes/auth.routes"));

app.listen(process.env.PORT, () => console.log("Server running on 5000"));