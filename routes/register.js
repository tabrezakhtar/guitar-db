
require("dotenv").config();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { Resend } = require("resend");
const { setAuthCookies } = require("../helpers/cookies");

async function findUserByEmail(email) {
  try {
    const user = await User.findOne({ email: email });
    return user;
  } catch (err) {
    console.error("Error finding user by email:", err);
    return null;
  }
}

async function registerUser(req, res, next) {
  const { username, email, bio, location } = req.body;
  const errors = [];
  const missing = [];

  if (!username) {
    missing.push("username");
    errors.push("Username is required");
  } else if (username.length > 25) {
    missing.push("username");
    errors.push("Username must be 25 characters or less");
  } else {
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
    if (emojiRegex.test(username)) {
      missing.push("username");
      errors.push("Username cannot contain emojis");
    }
  }
  if (!email) {
    missing.push("email");
    errors.push("Email is required");
  }

  if (missing.length > 0) {
    return res.status(400).json({ errors, missing });
  }

  try {
    let currentUser = null;
    const accessToken = req.cookies?.accessToken;
    
    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
        currentUser = await User.findById(decoded.id);
      } catch (err) {
      }
    }

    const isUpgradingGuest = currentUser && currentUser.guest === true;
    const registerErrors = [];

    const existingUser = await findUserByEmail(email);
    if (existingUser && (!isUpgradingGuest || existingUser._id.toString() !== currentUser._id.toString())) {
      registerErrors.push("This email is already registered");
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername && (!isUpgradingGuest || existingUsername._id.toString() !== currentUser._id.toString())) {
      registerErrors.push("This username is already taken");
    }

    if (registerErrors.length > 0) {
      return res.status(400).json({ errors: registerErrors, missing: [] });
    }

    let user;
    if (isUpgradingGuest) {
      currentUser.username = username;
      currentUser.email = email;
      currentUser.bio = bio || "";
      currentUser.location = location || "";
      currentUser.guest = false;
      currentUser.verified = false;
      user = currentUser;
    } else {
      user = new User({
        username,
        bio,
        location,
        email: email,
        verified: false,
      });
    }

    await user.save();

    const verificationCode = generateVerificationCode();
    const codeExpires = new Date(Date.now() + 15 * 60 * 1000);

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = codeExpires;
    user.verificationCodeAttempts = 0;
    await user.save();

    try {
      const resend = new Resend(process.env.EMAIL);
      const emailHtml = generateEmailTemplate("welcome", {
        username,
        verificationCode
      });

      const { error } = await resend.emails.send({
        from: "rifftales <noreply@rifftales.net>",
        to: [email],
        subject: "Welcome to rifftales - Verify Your Account",
        html: emailHtml,
      });

      if (error) {
        console.error("Error sending email:", error);
      }
    } catch (emailError) {
      console.error("Failed to send verification code email:", emailError);
    }

    return res.status(200).json({
      email: email.substring(0, 3) + "..." + email.substring(email.indexOf("@")),
      showVerificationForm: true,
      userId: user._id.toString()
    });
  } catch (error) {
    next(error);
  }
}

function generateVerificationCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function generateEmailTemplate(type, data) {
  const logoHeader = `
    <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 30px;">
      <img src="https://res.cloudinary.com/dx8d5hlk1/image/upload/v1757542336/favicon-192x192_kkkkll.png" alt="rifftales Logo" style="width: 64px; height: 64px; margin-right: 12px;" />
      <span style="color: #EAAA00; font-size: 48px; font-weight: bold; font-family: 'Varela Round', sans-serif;">rifftales</span>
    </div>
  `;

  const baseStyle = `
    <div style="font-family: 'Varela Round', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      ${logoHeader}
  `;

  const footerStyle = `
      <p style="font-size: 12px; color: #666; margin-top: 30px;">If you did not request this email, please delete it or ignore it. Someone may have entered your email address by mistake.</p>
    </div>
  `;

  switch (type) {
    case "welcome":
      return `${baseStyle}
        <h1 style="color: #3b82f6; text-align: center; margin-bottom: 30px;">Welcome to rifftales!</h1>
        <p style="font-size: 16px; margin-bottom: 20px;">Thank you for registering, ${data.username}!</p>
        <p style="font-size: 16px; margin-bottom: 30px;">Enter this 4-digit code to verify your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; background-color: #f3f4f6; color: #374151; padding: 20px 30px; font-size: 36px; font-weight: bold; letter-spacing: 8px; border-radius: 8px; border: 2px solid #d1d5db; font-family: 'Varela Round', sans-serif;">${data.verificationCode}</span>
        </div>
        <p style="font-size: 14px; color: #6b7280; text-align: center;">This code will expire in 15 minutes.</p>
        ${footerStyle}`;

    case "login":
      return `${baseStyle}
        <h1 style="color: #3b82f6; text-align: center; margin-bottom: 30px;">Login to rifftales</h1>
        <p style="font-size: 16px; margin-bottom: 20px;">Hello ${data.username},</p>
        <p style="font-size: 16px; margin-bottom: 30px;">Enter this 4-digit code to log in to your rifftales account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; background-color: #f3f4f6; color: #374151; padding: 20px 30px; font-size: 36px; font-weight: bold; letter-spacing: 8px; border-radius: 8px; border: 2px solid #d1d5db; font-family: 'Varela Round', sans-serif;">${data.verificationCode}</span>
        </div>
        <p style="font-size: 14px; color: #6b7280; text-align: center;">This code will expire in 15 minutes.</p>
        ${footerStyle}`;

    default:
      throw new Error("Invalid email template type");
  }
}

function generateTokens(userId, jwtSecret) {
  const accessToken = jwt.sign(
    { id: userId },
    jwtSecret,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { id: userId },
    jwtSecret,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
}

async function verifyCode(req, res, next) {
  const { code, userId } = req.body;
  const jwtSecret = process.env.JWT_SECRET;
  const errors = [];
  const missing = [];

  if (!code) {
    missing.push("code");
    errors.push("Verification code is required");
  }
  if (!userId) {
    missing.push("userId");
    errors.push("User ID is required");
  }

  if (missing.length > 0) {
    return res.status(400).json({
      email: "***@***",
      showVerificationForm: true,
      userId: userId || "",
      errors,
      missing
    });
  }
  try {
    let currentUser = null;
    const currentAccessToken = req.cookies?.accessToken;
    
    if (currentAccessToken) {
      try {
        const decoded = jwt.verify(currentAccessToken, jwtSecret);
        currentUser = await User.findById(decoded.id);
      } catch (err) {
      }
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        email: "***@***",
        showVerificationForm: false,
        errors: ["Invalid verification request. Please try logging in again."]
      });
    }

    const isUpgradingGuest = currentUser && currentUser.guest === true && currentUser._id.toString() === user._id.toString();

    if (!user.verificationCodeExpires || new Date() > user.verificationCodeExpires) {
      const emailDisplay = user.email.substring(0, 3) + "..." + user.email.substring(user.email.indexOf("@"));
      return res.status(400).json({
        email: emailDisplay,
        showVerificationForm: false,
        errors: ["Verification code has expired. Please request a new one."],
        showResendOnly: true,
        userId: user._id.toString()
      });
    }

    if (user.verificationCodeAttempts >= 5) {
      const emailDisplay = user.email.substring(0, 3) + "..." + user.email.substring(user.email.indexOf("@"));
      return res.status(400).json({
        email: emailDisplay,
        showVerificationForm: false,
        errors: ["Too many failed attempts. Please request a new code."],
        showResendOnly: true,
        userId: user._id.toString()
      });
    }

    if (user.verificationCode !== code) {
      user.verificationCodeAttempts += 1;
      await user.save();

      const remainingAttempts = 5 - user.verificationCodeAttempts;
      const emailDisplay = user.email.substring(0, 3) + "..." + user.email.substring(user.email.indexOf("@"));

      if (remainingAttempts > 0) {
        return res.status(400).json({
          email: emailDisplay,
          showVerificationForm: true,
          userId: user._id.toString(),
          errors: [],
          attemptCount: user.verificationCodeAttempts,
          maxAttempts: 5
        });
      } else {
        return res.status(400).json({
          email: emailDisplay,
          showVerificationForm: false,
          errors: ["Too many failed attempts. Please request a new code."],
          showResendOnly: true,
          userId: user._id.toString()
        });
      }
    }

    user.verificationCode = null;
    user.verificationCodeExpires = null;
    user.verificationCodeAttempts = 0;
    user.verified = true;
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id, jwtSecret);

    const userForClient = user.toObject();
    delete userForClient.verificationCode;
    delete userForClient.verificationCodeAttempts;
    delete userForClient.verificationCodeExpires;

    const isProd = process.env.NODE_ENV === "production";

    setAuthCookies(res, accessToken, refreshToken, isProd);

    return res.status(200).json({ user: userForClient });
  } catch (error) {
    next(error);
  }
}

async function sendEmailWithRetry(resendClient, emailOptions, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await Promise.race([
        resendClient.emails.send(emailOptions),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Email send timeout")), 15000)
        )
      ]);
      
      if (result.error) {
        lastError = result.error;
        console.error(`Email send attempt ${attempt} failed:`, result.error);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
      } else {
        return { success: true, result };
      }
    } catch (error) {
      lastError = error;
      console.error(`Email send attempt ${attempt} error:`, error.message);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
    }
  }
  
  return { success: false, error: lastError };
}

async function resendVerificationCode(req, res, next) {
  const { email, userId } = req.body;
  const errors = [];
  const missing = [];

  if (!email && !userId) {
    missing.push("email");
    errors.push("Email or user ID is required");
  }

  if (missing.length > 0) {
    return res.status(400).json({ errors, missing });
  }

  try {
    let existingUser;

    if (userId) {
      existingUser = await User.findById(userId);
    } else {
      existingUser = await findUserByEmail(email);
    }

    if (!existingUser) {
      console.error("User not found:", { email: email ? "provided" : "none", userId: userId || "none" });
      return res.status(400).json({ errors: ["No account found with this information"] });
    }

    if (existingUser.isBanned()) {
      return res.status(403).json({ errors: ["Your account has been banned. Please contact support for more information."] });
    }

    const verificationCode = generateVerificationCode();
    const codeExpires = new Date(Date.now() + 15 * 60 * 1000);

    existingUser.verificationCode = verificationCode;
    existingUser.verificationCodeExpires = codeExpires;
    existingUser.verificationCodeAttempts = 0;
    await existingUser.save();

    if (!process.env.EMAIL) {
      console.error("EMAIL environment variable not set");
      return res.status(500).json({ errors: ["Email service configuration error. Please contact support."] });
    }

    try {
      const resend = new Resend(process.env.EMAIL);
      const emailHtml = generateEmailTemplate("login", {
        username: existingUser.username,
        verificationCode
      });

      const emailResult = await sendEmailWithRetry(resend, {
        from: "rifftales <noreply@rifftales.net>",
        to: [existingUser.email],
        subject: "rifftales - New Verification Code",
        html: emailHtml,
      });

      if (!emailResult.success) {
        console.error("All email send attempts failed:", emailResult.error);
        return res.status(500).json({ errors: ["Failed to send verification code. Please try again."] });
      }
    } catch (emailError) {
      console.error("Email send exception:", {
        message: emailError.message,
        stack: emailError.stack,
        name: emailError.name
      });
      return res.status(500).json({ errors: ["Failed to send verification code. Please try again."] });
    }

    const emailDisplay = existingUser.email.substring(0, 3) + "..." + existingUser.email.substring(existingUser.email.indexOf("@"));

    return res.status(200).json({
      email: emailDisplay,
      showVerificationForm: true,
      userId: existingUser._id.toString()
    });
  } catch (error) {
    console.error("resendVerificationCode error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    next(error);
  }
}

async function guestLogin(req, res, next) {
  const jwtSecret = process.env.JWT_SECRET;

  try {
    let guestNumber;
    let guestUsername;
    let existingUser;

    do {
      guestNumber = Math.floor(100000 + Math.random() * 900000);
      guestUsername = `Guest${guestNumber}`;
      existingUser = await User.findOne({ username: guestUsername });
    } while (existingUser);

    const guestUser = new User({
      username: guestUsername,
      email: `${guestUsername.toLowerCase()}@guest.local`,
      bio: "Temporary guest user",
      location: "",
      verified: false,
      guest: true
    });

    await guestUser.save();

    const { accessToken, refreshToken } = generateTokens(guestUser._id, jwtSecret);

    // Remove sensitive fields before sending to client
    const guestUserForClient = guestUser.toObject();
    delete guestUserForClient.verificationCode;
    delete guestUserForClient.verificationCodeAttempts;
    delete guestUserForClient.verificationCodeExpires;

    const isProd = process.env.NODE_ENV === "production";

    setAuthCookies(res, accessToken, refreshToken, isProd);

    return res.status(200).json({ user: guestUserForClient });
  } catch (error) {
    next(error);
  }
}

module.exports = { registerUser, verifyCode, resendVerificationCode, guestLogin };
