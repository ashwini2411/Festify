const mongoose = require("mongoose");

const FieldSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: ["short_text", "long_text", "dropdown", "file_upload"],
    required: true,
  },
  label: { type: String, required: true },
  required: { type: Boolean, default: false },
  options: { type: [String], default: [] }, // For dropdowns
});

const FormSchemaModelSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    fields: [FieldSchema],
    registrationLimit: {
      type: Number,
      default: null, // null means no limit override
    },
    deadline: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const FormSchema = mongoose.model("FormSchema", FormSchemaModelSchema);
module.exports = FormSchema;
