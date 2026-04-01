const express = require("express");
const router = express.Router();
const { getAnalytics } = require("../controllers/analyticsController");
const { protect, admin } = require("../middleware/authMiddleware");

// Route is protected and explicitly requires admin role
router.get("/", protect, admin, getAnalytics);

module.exports = router;
