require("dotenv").config();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Resend } = require("resend");

async function findUserByEmail(email) {
  try {
    const users = await User.find({});
    for (const user of users) {
      try {
        const isMatch = await bcrypt.compare(email, user.email);
        if (isMatch) {
          return user;
        }
      } catch (err) {
        // Skip any users with invalid email hash format
        continue;
      }
    }
    return null;
  } catch (err) {
    console.error("Error finding user by email:", err);
    return null;
  }
}

// this is use in the new templates
async function registerUser(req, res) {
  const { username, email, bio, location } = req.body;
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
    if (bio) req.flash("bio", bio);
    if (location) req.flash("location", location);
    return res.redirect("/register");
  }

  try {
    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      req.flash("errors", ["This email is already registered"]);
      req.flash("username", username);
      req.flash("bio", bio);
      req.flash("location", location);
      return res.redirect("/register");
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      req.flash("errors", ["This username is already taken"]);
      req.flash("email", email);
      req.flash("bio", bio);
      req.flash("location", location);
      return res.redirect("/register");
    }
    
    // All validation passed, create user
    const jwtSecret = process.env.JWT_SECRET;
    const hashedEmail = await bcrypt.hash(email, 10);
    
    const user = new User({
      username,
      bio,
      location,
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

    return res.render("success", { 
      title: "Registration Successful - Guitar DB",
      email: email.substring(0, 3) + "..." + email.substring(email.indexOf("@"))
    });
  } catch (error) {
    console.log(error);
    req.flash("errors", ["Server error. Please try again."]);
    return res.redirect("/register");
  }
}

// Helper function to generate magic link
function generateMagicLink(userId, jwtSecret) {
  const magicToken = jwt.sign(
    { id: userId },
    jwtSecret,
    { expiresIn: "7d" }
  );
  
  const baseUrl = process.env.BACKEND_URL;
  return `${baseUrl}/api/auth/verifymagiclink?token=${magicToken}`;
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
        <p>Hello ${data.username},</p>
        <p>Click the link below to log in to your Guitar DB account:</p>
        <p><a href="${data.magicLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Log In</a></p>
        <p>Or copy and paste this link:</p>
        <p>${data.magicLink}</p>
        <p>This link will expire in 7 days.</p>
        ${footerStyle}`;
        
    default:
      throw new Error("Invalid email template type");
  }
}

async function verifyMagicLink(req, res) {
  const { token } = req.query;
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
    return res.render("verify", { 
      token: sessionToken,
      user
    });
  } catch (error) {
    console.log(error);
    req.flash("errors", ["Invalid or expired token"]);
    return res.redirect("/login");
  }
}

// Function to resend magic link for users with expired tokens
async function resendMagicLink(req, res) {
  const { email } = req.body;
  const errors = [];
  const missing = [];
  
  if (!email) {
    missing.push("email");
    errors.push("Email is required");
  }
  
  if (missing.length > 0) {
    req.flash("errors", errors);
    req.flash("missing", missing);
    if (email) req.flash("email", email);
    return res.redirect("/login");
  }
  
  try {
    // Find user by email
    const existingUser = await findUserByEmail(email);
    
    if (!existingUser) {
      req.flash("errors", ["No account found with this email address"]);
      if (email) req.flash("email", email);
      return res.redirect("/login");
    }
    
    const jwtSecret = process.env.JWT_SECRET;
    const magicLink = generateMagicLink(existingUser._id, jwtSecret);
    
    // Send magic link email
    try {
      const resend = new Resend(process.env.EMAIL);
      const emailHtml = generateEmailTemplate("login", {
        username: existingUser.username,
        magicLink
      });
      
      const { error } = await resend.emails.send({
        from: "Guitar DB <onboarding@resend.dev>",
        to: ["delivered@resend.dev"], // In production, use: to: [email]
        subject: "Guitar DB - Login Link",
        html: emailHtml,
      });

      if (error) {
        console.error("Error sending email:", error);
        req.flash("errors", ["Failed to send login link. Please try again."]);
        return res.redirect("/login");
      }
    } catch (emailError) {
      console.error("Failed to send login email:", emailError);
      req.flash("errors", ["Failed to send login link. Please try again."]);
      return res.redirect("/login");
    }
    
    return res.render("success", { 
      title: "Login Link Sent - Guitar DB",
      email: email.substring(0, 3) + "..." + email.substring(email.indexOf("@"))
    });
  } catch (error) {
    console.log(error);
    req.flash("errors", ["Server error. Please try again."]);
    return res.redirect("/login");
  }
}

module.exports = { registerUser, verifyMagicLink, resendMagicLink };