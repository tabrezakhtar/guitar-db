require("dotenv").config();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function login(req, res) {
  if (!req.body) {
    return res.status(400).send("No request body provided");
  }

  const { email, password } = req.body;
  const jwtSecret = process.env.JWT_SECRET;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "15m" });
    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function register(req, res) {
  if (!req.body) {
    return res.status(400).send("No request body provided");
  }

  const { email, password } = req.body;
  const jwtSecret = process.env.JWT_SECRET;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "15m" });
    res.status(201).json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function getUserProfile(req, res) {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    const user = await User.findById(userId).select("username bio location website createdAt");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.log(error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { login, register, getUserProfile };