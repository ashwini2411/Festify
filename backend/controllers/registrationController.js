const Registration = require("../models/Registration");
const Event = require("../models/Event");
const crypto = require("crypto");

// @desc    Register for an event
// @route   POST /api/registrations/:eventId
// @access  Private/Student
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if the event is full
    if (event.seatsFilled >= event.capacity) {
      return res.status(400).json({ message: "Event is at full capacity" });
    }

    // Generate a unique ticket ID
    const ticketId = `TKT-${crypto.randomBytes(4).toString("hex").toUpperCase()}-${req.user._id.toString().slice(-4)}`;

    const registration = new Registration({
      studentId: req.user._id,
      eventId: req.params.eventId,
      dynamicAnswers: req.body.dynamicAnswers || {},
      ticketId: ticketId
    });

    await registration.save();
    
    // Update the seatsFilled counter
    event.seatsFilled += 1;
    await event.save();

    res.status(201).json({ message: "Successfully registered", registration });
  } catch (error) {
    if (error.code === 11000) {
      // Handle the unique constraint error
      res.status(400).json({ message: "You are already registered for this event" });
    } else {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
};

// @desc    Get logged in student's registrations
// @route   GET /api/registrations/my-tickets
// @access  Private/Student
const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({
      studentId: req.user._id,
    }).populate("eventId");
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get attendees for a specific event
// @route   GET /api/registrations/event/:eventId
// @access  Private/Admin
const getEventAttendees = async (req, res) => {
  try {
    const registrations = await Registration.find({
      eventId: req.params.eventId,
    }).populate("studentId", "name email");

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Cancel a registration
// @route   DELETE /api/registrations/:registrationId
// @access  Private/Student
const cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.registrationId);

    if (registration) {
      // Ensure only the student who owns the ticket can cancel it
      if (registration.studentId.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: "Not authorized to cancel this ticket" });
      }

      await registration.deleteOne();

      // Free up the seat on the event
      const event = await Event.findById(registration.eventId);
      if (event && event.seatsFilled > 0) {
        event.seatsFilled -= 1;
        await event.save();
      }

      res.json({ message: "Registration cancelled" });
    } else {
      res.status(404).json({ message: "Registration not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// @desc    Check-in a student via QR Code (ticketId)
// @route   POST /api/registrations/checkin/:ticketId
// @access  Private/Admin
const checkInStudent = async (req, res) => {
  try {
    const registration = await Registration.findOne({ ticketId: req.params.ticketId }).populate("studentId", "name email");

    if (!registration) {
      return res.status(404).json({ message: "Invalid Ticket ID" });
    }

    if (registration.checkedIn) {
      return res.status(400).json({ message: "Student is already checked in!" });
    }

    registration.checkedIn = true;
    await registration.save();

    res.json({ message: "Check-in successful!", student: registration.studentId });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { registerForEvent, getMyRegistrations, getEventAttendees, cancelRegistration, checkInStudent };
