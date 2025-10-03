const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  bio: {
    type: String,
    default: ""
  },
  avatarUrl: {
    type: String,
    default: ""
  },
  location: {
    type: String,
    default: ""
  },
  website: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: () => new Date(new Date().toISOString())
  },
  verified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    default: null
  },
  verificationCodeExpires: {
    type: Date,
    default: null
  },
  verificationCodeAttempts: {
    type: Number,
    default: 0
  },
  guest: {
    type: Boolean,
    default: false
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;