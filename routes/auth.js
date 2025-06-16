require("dotenv").config();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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

    const magicLink = generateMagicLink(user._id, jwtSecret);

    // Send magic link email
    try {
      const resend = new Resend(process.env.EMAIL);
      const emailHtml = generateEmailTemplate("welcome", {
        username,
        magicLink
      });
      
      const { error } = await resend.emails.send({
        from: "Guitar DB <onboarding@resend.dev>",
        to: ["delivered@resend.dev"],
        subject: "Welcome to Guitar DB - Verify Your Account",
        html: emailHtml,
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

// Helper function to generate magic link
function generateMagicLink(userId, jwtSecret) {
  const magicToken = jwt.sign(
    { id: userId },
    jwtSecret,
    { expiresIn: "7d" }
  );
  
  const baseUrl = process.env.BACKEND_URL || "http://localhost:5000";
  return `${baseUrl}/verifymagiclink?token=${magicToken}`;
}

// Helper function to generate email templates
function generateEmailTemplate(type, data) {
  const baseStyle = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  `;
  
  const footerStyle = `
      <p style="font-size: 12px; color: #666;">If you did not request this email, please delete it or ignore it. Someone may have entered your email address by mistake.</p>
    </div>
  `;

  switch (type) {
    case "welcome":
      return `${baseStyle}
        <h1>Welcome to Guitar DB!</h1>
        <p>Thank you for registering, ${data.username}!</p>
        <p>Click the link below to verify your account:</p>
        <p><a href="${data.magicLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Verify Account</a></p>
        <p>Or copy and paste this link:</p>
        <p>${data.magicLink}</p>
        <p>This link will expire in 7 days.</p>
        ${footerStyle}`;
        
    case "login":
      return `${baseStyle}
        <h1>Login to Guitar DB</h1>
        <p>Hello ${data.username}!</p>
        <p>Click the link below to login to your account:</p>
        <p><a href="${data.magicLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Login to Account</a></p>
        <p>Or copy and paste this link:</p>
        <p>${data.magicLink}</p>
        <p>This link will expire in 7 days.</p>
        ${footerStyle}`;
        
    default:
      throw new Error("Invalid email template type");
  }
}

async function sendMagicLink(req, res) {
  if (!req.body) {
    return res.status(400).send({
      message: "No request body provided",
      errors: "Request body is required"
    });
  }

  const { email } = req.body;
  const jwtSecret = process.env.JWT_SECRET;

  if (!email) {
    return res.status(400).json({ 
      message: "Email is required",
      errors: "Email is required"
    });
  }

  try {
    // Find user by checking hashed email against all users
    const users = await User.find({});
    let matchedUser = null;

    for (const user of users) {
      const isMatch = await bcrypt.compare(email, user.email);
      if (isMatch) {
        matchedUser = user;
        break;
      }
    }

    if (!matchedUser) {
      return res.status(404).json({
        message: "User not found",
        errors: "No user found with this email address"
      });
    }

    const magicLink = generateMagicLink(matchedUser._id, jwtSecret);

    // Send magic link email
    try {
      const resend = new Resend(process.env.EMAIL);
      const emailHtml = generateEmailTemplate("login", {
        username: matchedUser.username,
        magicLink
      });
      
      const { error } = await resend.emails.send({
        from: "Guitar DB <onboarding@resend.dev>",
        to: ["delivered@resend.dev"],
        subject: "Guitar DB - Login Link",
        html: emailHtml,
      });

      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({
          message: "Failed to send email",
          errors: "There was an error sending the magic link email"
        });
      }
    } catch (emailError) {
      console.error("Failed to send magic link email:", emailError);
      return res.status(500).json({
        message: "Failed to send email",
        errors: "There was an error sending the magic link email"
      });
    }

    res.status(200).json({ 
      message: "Magic link sent successfully",
      userId: matchedUser._id
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
    const user = await User.findById(decoded.id).select("-email");

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

async function testEndpoint(req, res) {
  const { username, email } = req.body;
  const errors = [];
  const missing = [];
  if (!username) {
    missing.push("username");
    errors.push("Username is required");
  }
  if (!email) {
    missing.push("email");
    errors.push("Email is required");
  }
  if (missing.length > 0) {
    req.flash("errors", errors);
    req.flash("missing", missing);
    if (username) req.flash("username", username);
    if (email) req.flash("email", email);
    return res.redirect("/login");
  }
  return res.render("success");
}

module.exports = { login, register, createUserProfile, sendMagicLink, verifyMagicLink, refreshToken, testEndpoint };