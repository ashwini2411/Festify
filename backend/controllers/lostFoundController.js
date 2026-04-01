const LostItem = require("../models/LostItem");

// @desc    Get all lost items
// @route   GET /api/lost-items
// @access  Public
const getLostItems = async (req, res) => {
  try {
    const items = await LostItem.find().populate("reportedBy", "username email");
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error retrieving items" });
  }
};

// @desc    Report a new lost item
// @route   POST /api/lost-items
// @access  Private
const reportItem = async (req, res) => {
  const { itemName, description, dateLost, location, imageUrl } = req.body;

  try {
    const item = new LostItem({
      itemName,
      description,
      dateLost,
      location,
      imageUrl,
      reportedBy: req.user._id,
    });

    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(400).json({ message: "Invalid item data" });
  }
};

module.exports = { getLostItems, reportItem };
