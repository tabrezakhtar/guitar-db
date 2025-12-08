require("dotenv").config();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { Resend } = require("resend");

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
    req.flash("errors", errors);
    req.flash("missing", missing);
    if (username) req.flash("username", username);
    if (email) req.flash("email", email);
    if (bio) req.flash("bio", bio);
    if (location) req.flash("location", location);
    return res.redirect("/register");
  }

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      req.flash("errors", ["This email is already registered"]);
      req.flash("username", username);
      req.flash("bio", bio);
      req.flash("location", location);
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      req.flash("errors", ["This username is already taken"]);
      req.flash("email", email);
      req.flash("bio", bio);
      req.flash("location", location);
    }

    if (existingUser || existingUsername) {
      return res.redirect("/register");
    }

    const user = new User({
      username,
      bio,
      location,
      email: email,
      verified: false,
    });

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

    return res.render("success", {
      title: "Registration Successful - rifftales",
      email: email.substring(0, 3) + "..." + email.substring(email.indexOf("@")),
      showVerificationForm: true,
      userId: user._id.toString(),
      titleColor: "white"
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
    const emailDisplay = "***@***";
    return res.render("success", {
      title: "Enter Verification Code - rifftales",
      email: emailDisplay,
      showVerificationForm: true,
      userId: userId || "",
      errors: errors,
      missing: missing,
      titleColor: "white"
    });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.render("success", {
        title: "Verification Error - rifftales",
        email: "***@***",
        showVerificationForm: false,
        errors: ["Invalid verification request. Please try logging in again."]
      });
    }

    if (!user.verificationCodeExpires || new Date() > user.verificationCodeExpires) {
      const emailDisplay = user.email.substring(0, 3) + "..." + user.email.substring(user.email.indexOf("@"));
      return res.render("success", {
        title: "Code Expired - rifftales",
        email: emailDisplay,
        showVerificationForm: false,
        errors: ["Verification code has expired. Please request a new one."],
        showResendOnly: true,
        userId: user._id.toString()
      });
    }

    if (user.verificationCodeAttempts >= 5) {
      const emailDisplay = user.email.substring(0, 3) + "..." + user.email.substring(user.email.indexOf("@"));
      return res.render("success", {
        title: "Too Many Attempts - rifftales",
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
        return res.render("success", {
          title: "Invalid Code - rifftales",
          email: emailDisplay,
          showVerificationForm: true,
          userId: user._id.toString(),
          errors: [`Invalid code. ${remainingAttempts} attempts remaining.`],
          attemptCount: user.verificationCodeAttempts,
          maxAttempts: 5,
          titleColor: "white"
        });
      } else {
        return res.render("success", {
          title: "Too Many Attempts - rifftales",
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

    const sessionToken = jwt.sign(
      { id: user._id },
      jwtSecret,
      { expiresIn: "1h" }
    );

    return res.render("verify", {
      token: sessionToken,
      user
    });
  } catch (error) {
    next(error);
  }
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
    req.flash("errors", errors);
    req.flash("missing", missing);
    if (email) req.flash("email", email);
    return res.redirect("/login");
  }

  try {
    let existingUser;

    if (userId) {
      existingUser = await User.findById(userId);
    } else {
      existingUser = await findUserByEmail(email);
    }

    if (!existingUser) {
      req.flash("errors", ["No account found with this information"]);
      if (email) req.flash("email", email);
      return res.redirect("/login");
    }

    const verificationCode = generateVerificationCode();
    const codeExpires = new Date(Date.now() + 15 * 60 * 1000);

    existingUser.verificationCode = verificationCode;
    existingUser.verificationCodeExpires = codeExpires;
    existingUser.verificationCodeAttempts = 0;
    await existingUser.save();

    try {
      const resend = new Resend(process.env.EMAIL);
      const emailHtml = generateEmailTemplate("login", {
        username: existingUser.username,
        verificationCode
      });

      const { error } = await resend.emails.send({
        from: "rifftales <noreply@rifftales.net>",
        to: [existingUser.email],
        subject: "rifftales - New Verification Code",
        html: emailHtml,
      });

      if (error) {
        console.error("Error sending email:", error);
        req.flash("errors", ["Failed to send verification code. Please try again."]);
        return res.redirect("/login");
      }
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      req.flash("errors", ["Failed to send verification code. Please try again."]);
      return res.redirect("/login");
    }

    const emailDisplay = existingUser.email.substring(0, 3) + "..." + existingUser.email.substring(existingUser.email.indexOf("@"));

    return res.render("success", {
      title: "New Code Sent - rifftales",
      email: emailDisplay,
      showVerificationForm: true,
      userId: existingUser._id.toString(),
      titleColor: "white"
    });
  } catch (error) {
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
      verified: true,
      guest: true
    });

    await guestUser.save();

    const sessionToken = jwt.sign(
      { id: guestUser._id },
      jwtSecret,
      { expiresIn: "1h" }
    );

    return res.render("verify", {
      token: sessionToken,
      user: guestUser
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { registerUser, verifyCode, resendVerificationCode, guestLogin };
