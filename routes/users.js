require("dotenv").config();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

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

async function createUserProfile(req, res) {
  if (!req.body) {
    return res.status(400).send("No request body provided");
  }

  const { username, bio, location, website, email } = req.body;
  const jwtSecret = process.env.JWT_SECRET;

  if (!username) {
    return res.status(400).json({ message: "Username and email are required" });
  }

  try {
    let user = await User.findOne({ email });
    
    if (user) {
      // Update existing user profile
      user.username = username;
      user.bio = bio || user.bio;
      user.location = location || user.location;
      user.website = website || user.website;
    } else {
      // Create new user without password
      user = new User({
        username,
        email,
        bio,
        location,
        website
      });
    }

    await user.save();

    // Generate a magic link token with long expiration
    const magicToken = jwt.sign(
      { id: user._id },
      jwtSecret,
      { expiresIn: "7d" }
    );
    
    // Create magic link URL (should be configured based on environment)
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const magicLink = `${baseUrl}/login/magic?token=${magicToken}`;

    res.status(201).json({ 
      message: "Profile created successfully",
      userId: user._id,
      magicLink
    });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Username already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
}

async function verifyMagicLink(req, res) {
  const { token } = req.body;
  const jwtSecret = process.env.JWT_SECRET;
  console.log("Token received:", token);
  if (!token) {
    return res.status(400).json({ message: "No token provided" });
  }
  
  try {
    // Verify the token from the magic link
    const decoded = jwt.verify(token, jwtSecret);
    
    // Find user based on id in token
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Generate a new session token with shorter expiration
    const sessionToken = jwt.sign(
      { id: user._id },
      jwtSecret,
      { expiresIn: "1h" }
    );
    
    // Return session token and user info
    res.json({
      token: sessionToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        location: user.location,
        website: user.website,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.log(error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { login, register, getUserProfile, createUserProfile, verifyMagicLink };