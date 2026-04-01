const Event = require("../models/Event");
const FormSchema = require("../models/FormSchema");

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("organizer", "name email");
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res) => {
  const { title, description, venue, date, capacity, category, startTime, endTime, targetAudience, formFields, registrationLimit, deadline } = req.body;

  try {
    // Basic Clash Detection (same venue, overlapping time)
    if (startTime && endTime) {
      const clash = await Event.findOne({
        venue: venue,
        $or: [
          { startTime: { $lte: new Date(endTime) }, endTime: { $gte: new Date(startTime) } }
        ]
      });

      if (clash) {
         return res.status(409).json({ message: "Clash Alert: Another event is scheduled at this venue during this time.", clash });
      }
    }

    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let slug = baseSlug;
    let count = 1;
    while (await Event.findOne({ slug })) {
        slug = `${baseSlug}-${count}`;
        count++;
    }

    const event = new Event({
      title,
      description,
      venue,
      date, // We can keep date or rely on startTime/endTime
      capacity,
      category,
      organizer: req.user._id,
      slug,
      targetAudience,
      startTime,
      endTime
    });

    const createdEvent = await event.save();

    // Create FormSchema if fields are provided
    if (formFields && formFields.length > 0) {
      const formSchema = new FormSchema({
        eventId: createdEvent._id,
        fields: formFields,
        registrationLimit: registrationLimit || null,
        deadline: deadline || null
      });
      const savedSchema = await formSchema.save();
      createdEvent.formSchemaId = savedSchema._id;
      await createdEvent.save();
    }

    res.status(201).json(createdEvent);
  } catch (error) {
    res.status(400).json({ message: "Invalid event data", error: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      if (event.organizer.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: "Not authorized to delete this event" });
      }

      await event.deleteOne();
      res.json({ message: "Event removed" });
    } else {
      res.status(404).json({ message: "Event not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get a single event by slug
// @route   GET /api/events/:slug
// @access  Public
const getEventBySlug = async (req, res) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug })
      .populate("organizer", "name email")
      .populate("formSchemaId");
      
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: "Event not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getEvents, getEventBySlug, createEvent, deleteEvent };
