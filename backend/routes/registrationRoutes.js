const express = require("express");
const router = express.Router();
const {
  registerForEvent,
  getMyRegistrations,
  getEventAttendees,
  cancelRegistration,
  checkInStudent
} = require("../controllers/registrationController");
const { protect, admin } = require("../middleware/authMiddleware");

router.post("/checkin/:ticketId", protect, admin, checkInStudent);
router.post("/:eventId", protect, registerForEvent);
router.get("/my-tickets", protect, getMyRegistrations);
router.get("/event/:eventId", protect, admin, getEventAttendees);
router.delete("/:registrationId", protect, cancelRegistration);

module.exports = router;
