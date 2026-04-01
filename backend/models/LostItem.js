const mongoose = require("mongoose");

const LostItemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    dateLost: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: "", // Can store a base64 or a link to an image
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["lost", "found", "returned"],
      default: "lost",
    },
  },
  { timestamps: true }
);

const LostItem = mongoose.model("LostItem", LostItemSchema);
module.exports = LostItem;
