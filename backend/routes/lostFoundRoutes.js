const express = require("express");
const router = express.Router();
const { getLostItems, reportItem } = require("../controllers/lostFoundController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").get(getLostItems).post(protect, reportItem);

module.exports = router;
