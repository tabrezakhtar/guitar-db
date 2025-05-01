require("dotenv").config();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function login(req, res) {
  if (!req.body) {
    return res.status(400).send({
      message: "No request body provided", 
      errors: "Request body is required"
    });
  }

  const { email, password } = req.body;
  const jwtSecret = process.env.JWT_SECRET;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User not found",
        errors: "No user found with this email address"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
        errors: "Incorrect password"
      });
    }

    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "15m" });
    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
      errors: "An internal server error occurred"
    });
  }
}

async function register(req, res) {
  if (!req.body) {
    return res.status(400).send({
      message: "No request body provided",
      errors: "Request body is required"
    });
  }

  const { email, password } = req.body;
  const jwtSecret = process.env.JWT_SECRET;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "User already exists",
        errors: "A user with this email already exists"
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "15m" });
    res.status(201).json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
      errors: "An internal server error occurred"
    });
  }
}

async function getUserProfile(req, res) {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        message: "User ID is required",
        errors: "User ID is required"
      });
    }
    
    const user = await User.findById(userId).select("username bio location website createdAt");
    
    if (!user) {
      return res.status(404).json({ 
        message: "User not found",
        errors: "No user found with this ID"
      });
    }
    
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      message: "Server error",
      errors: "An internal server error occurred"
    });
  }
}

async function createUserProfile(req, res) {
  if (!req.body) {
    return res.status(400).send({
      message: "No request body provided",
      errors: "Request body is required"
    });
  }

  const { username, bio, location, website } = req.body;
  const jwtSecret = process.env.JWT_SECRET;

  if (!username) {
    return res.status(400).json({ 
      message: "Username is required",
      errors: "Username is required"
    });
  }

  try {
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        message: "Username already exists",
        errors: "This username is already taken"
      });
    }

    const user = new User({
      username,
      bio,
      location,
      website
    });

    await user.save();

    const magicToken = jwt.sign(
      { id: user._id },
      jwtSecret,
      { expiresIn: "7d" }
    );
    
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const magicLink = `${baseUrl}/login/magic?token=${magicToken}`;

    res.status(201).json({ 
      message: "Profile created successfully",
      userId: user._id,
      magicLink
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      message: "Server error",
      errors: "An internal server error occurred"
    });
  }
}

async function verifyMagicLink(req, res) {
  const { token } = req.body;
  const jwtSecret = process.env.JWT_SECRET;
  console.log("Token received:", token);
  if (!token) {
    return res.status(400).json({ 
      message: "No token provided",
      errors: "Token is required"
    });
  }
  
  try {
    // Verify the token from the magic link
    const decoded = jwt.verify(token, jwtSecret);
    
    // Find user based on id in token
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ 
        message: "User not found",
        errors: "No user found with this ID"
      });
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
      return res.status(401).json({ 
        message: "Invalid token",
        errors: "Invalid token"
      });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        message: "Token has expired",
        errors: "Token has expired"
      });
    }
    res.status(500).json({ 
      message: "Server error",
      errors: "An internal server error occurred"
    });
  }
}

async function updateUserProfile(req, res) {
  if (!req.body) {
    return res.status(400).send({
      message: "No request body provided",
      errors: "Request body is required"
    });
  }

  const { id, username, bio, location, website } = req.body;

  if (!id) {
    return res.status(400).json({ 
      message: "User ID is required",
      errors: "User ID is required"
    });
  }

  if (!username) {
    return res.status(400).json({ 
      message: "Username is required",
      errors: "Username is required"
    });
  }

  try {
    const existingUsername = await User.findOne({ username, _id: { $ne: id } });
    if (existingUsername) {
      return res.status(400).json({
        message: "Username already exists",
        errors: "This username is already taken"
      });
    }

    let user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        errors: "No user found with this ID"
      });
    }

    user.username = username;
    user.bio = bio || user.bio;
    user.location = location || user.location;
    user.website = website || user.website;

    await user.save();

    res.status(200).json({ 
      message: "Profile updated successfully",
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
    res.status(500).json({ 
      message: "Server error",
      errors: "An internal server error occurred"
    });
  }
}

module.exports = { login, register, getUserProfile, createUserProfile, updateUserProfile, verifyMagicLink };