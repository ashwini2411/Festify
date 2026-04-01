require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const lostFoundRoutes = require("./routes/lostFoundRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/lost-items", lostFoundRoutes);

// Basic Route for Testing
app.get("/", (req, res) => {
  res.send("Festify API is running...");
});

// Database Connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/festify")
  .then(() => {
    console.log("Connected to MongoDB.");
  })
  .catch((err) => {
    console.error("CRITICAL: MongoDB connection error. Ensure your MongoDB server is running!", err);
  });

// Always start the Express server so API proxy doesn't hang
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
