const User = require("../models/User");
const Event = require("../models/Event");
const Registration = require("../models/Registration");

// @desc    Get dashboard analytics
// @route   GET /api/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "student" });
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments();

    // Department Breakdown Data
    const departmentBreakdown = await User.aggregate([
      { $match: { role: "student", department: { $exists: true, $ne: "" } } },
      { $group: { _id: "$department", count: { $sum: 1 } } }
    ]);

    // Registration Velocity (Registrations per day)
    const recentRegistrations = await Registration.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          registrations: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalUsers,
      totalEvents,
      totalRegistrations,
      departmentBreakdown,
      registrationVelocity: recentRegistrations
    });
  } catch (error) {
    res.status(500).json({ message: "Server error retrieving analytics" });
  }
};

module.exports = { getAnalytics };
