const mongoose = require("mongoose");

const RegistrationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    dynamicAnswers: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ticketId: {
      type: String,
      unique: true,
      required: true,
    },
    checkedIn: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Ensuring a student can only register once per event
RegistrationSchema.index({ studentId: 1, eventId: 1 }, { unique: true });

const Registration = mongoose.model("Registration", RegistrationSchema);
module.exports = Registration;
