const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "defaultsecret", {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { email, istuNo, username, password, role } = req.body;

  try {
    const userExists = await User.findOne({ $or: [{ username }, { email }] });

    if (userExists) {
      return res.status(400).json({ message: "An account with that Username or Email already exists." });
    }

    const user = await User.create({
      email,
      istuNo: istuNo || `admin_id_${Date.now()}`, // Guarantees uniqueness if old MongoDB index still exists
      username,
      password,
      role: role || "student",
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ message: `Error: That ${field} is already taken in the database.` });
    }
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    let user = await User.findOne({ username });

    // Seed default admin if missing for testing convenience
    if (!user && username.toLowerCase() === 'admin') {
       user = await User.create({
          username: "Admin",
          email: "admin@festify.com",
          password: password || "admin123",
          role: "admin",
          istuNo: `admin_id_${Date.now()}`
       });
    }

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

module.exports = { registerUser, authUser };
