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
    const token = req.header("x-auth-token");
    
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }
    
    const jwtSecret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, jwtSecret);
    
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.log(error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { login, register, getUserProfile };