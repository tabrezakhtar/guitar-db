require("dotenv").config();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { Comments, Equipment } = require("../models/equipment.js");
const jwt = require("jsonwebtoken");
const { deleteCloudinaryImages } = require("../helpers/cloudinary");
const { Resend } = require("resend");

// unused
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

// unused
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

    // Get user's 10 most recent comments
    const recentComments = await Comments.find({ user: userId })
      .sort({ date: -1 })
      .limit(10)
      .select("_id text equipmentId date")
      .populate({
        path: "user",
        select: "_id username avatarUrl"
      })
      .populate({
        path: "equipmentId",
        select: "_id name brand",
      });

    // Find equipment that has this user's ID in the likes array
    const likedEquipment = await Equipment.find({ likes: userId })
      .select("_id name brand images");

    res.json({ user, comments: recentComments, likedEquipment });
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

  const { username, bio, location, website, avatarUrl, email } = req.body;
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

    const salt = await bcrypt.genSalt(10);
    const hashedEmail = await bcrypt.hash(email, salt);

    const user = new User({
      username,
      bio,
      location,
      website,
      avatarUrl,
      email: hashedEmail,
      verified: false,
    });

    await user.save();

    const magicToken = jwt.sign(
      { id: user._id },
      jwtSecret,
      { expiresIn: "7d" }
    );
    
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const magicLink = `${baseUrl}/login/magic?token=${magicToken}`;

    // Send magic link email
    try {
      const resend = new Resend(process.env.EMAIL);
      const { data, error } = await resend.emails.send({
        from: "Guitar DB <onboarding@resend.dev>",
        to: ["delivered@resend.dev"],
        subject: "Welcome to Guitar DB - Verify Your Account",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Welcome to Guitar DB!</h1>
            <p>Thank you for registering, ${username}!</p>
            <p>Click the link below to verify your account:</p>
            <p><a href="${magicLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Verify Account</a></p>
            <p>Or copy and paste this link:</p>
            <p>${magicLink}</p>
            <p>This link will expire in 7 days.</p>
            <p style="font-size: 12px; color: #666;">If you did not request this email, please delete it or ignore it. Someone may have entered your email address by mistake.</p>
          </div>
        `,
      });

      if (error) {
        console.error("Error sending email:", error);
      }
    } catch (emailError) {
      console.error("Failed to send magic link email:", emailError);
    }

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

async function updateUserProfile(req, res) {
  if (!req.body) {
    return res.status(400).send({
      message: "No request body provided",
      errors: "Request body is required"
    });
  }

  const { _id, username, bio, location, website, avatarUrl } = req.body;

  if (!_id) {
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
    const existingUsername = await User.findOne({ username, _id: { $ne: _id } });
    if (existingUsername) {
      return res.status(400).json({
        message: "Username already exists",
        errors: "This username is already taken"
      });
    }

    let user = await User.findById(_id);
    
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
    user.avatarUrl = avatarUrl || user.avatarUrl;

    await user.save();

    res.status(200).json({ 
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        username: user.username,
        bio: user.bio,
        location: user.location,
        website: user.website,
        createdAt: user.createdAt,
        avatarUrl: user.avatarUrl
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

    user.verified = true;
    await user.save();
    
    // Return session token and user info
    res.json({
      token: sessionToken,
      user
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

async function deleteUserAvatar(req, res) {
  if (!req.body || !req.body.userId || !req.body.avatarUrl) {
    return res.status(400).json({
      message: "AvatarUrl is required",
      errors: "User Id is required.  AvatarUrl is required"
    });
  }

  const { avatarUrl, userId } = req.body;

  try {
    const user = await User.findById(userId);
    
    // if (!user) {
    //   return res.status(404).json({
    //     message: "User not found",
    //     errors: "No user found with this ID"
    //   });
    // }

    // if (!user.avatarUrl) {
    //   return res.status(400).json({
    //     message: "No avatar to delete",
    //     errors: "This user does not have an avatar"
    //   });
    // }

    await deleteCloudinaryImages([avatarUrl]);
    
    user.avatarUrl = null;
    await user.save();

    res.status(200).json({
      message: "Avatar deleted successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        location: user.location,
        website: user.website,
        createdAt: user.createdAt,
        avatarUrl: null
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

async function refreshToken(req, res) {
  const token = req.header("Authorization")?.replace("Bearer ", "") || req.header("x-auth-token");

  if (!token) {
    return res.status(400).json({
      message: "No token provided",
      errors: "Token is required"
    });
  }
  
  const jwtSecret = process.env.JWT_SECRET;

  try {
    // Verify the existing token
    const decoded = jwt.verify(token, jwtSecret, { ignoreExpiration: true });
    
    // Find user based on id in token
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        errors: "No user found with this ID"
      });
    }
    
    // Check if token is within a reasonable refresh window (e.g., expired within last 7 days)
    const currentTime = Math.floor(Date.now() / 1000);
    const tokenExpiry = decoded.exp;
    const refreshWindowSeconds = 7 * 24 * 60 * 60; // 7 days in seconds
    
    if (currentTime - tokenExpiry > refreshWindowSeconds) {
      return res.status(401).json({
        message: "Token expired beyond refresh window",
        errors: "Please log in again"
      });
    }
    
    // Generate a new token
    const newToken = jwt.sign(
      { id: user._id },
      jwtSecret,
      { expiresIn: "15m" }
    );
    
    // Return the new token
    res.json({ token: newToken });
  } catch (error) {
    console.log(error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token",
        errors: "Invalid token"
      });
    }
    res.status(500).json({
      message: "Server error",
      errors: "An internal server error occurred"
    });
  }
}

module.exports = { login, register, getUserProfile, createUserProfile, updateUserProfile, verifyMagicLink, deleteUserAvatar, refreshToken };