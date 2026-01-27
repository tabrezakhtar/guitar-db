require("dotenv").config();
const { clearAuthCookies } = require("../helpers/cookies");
const User = require("../models/user");

async function logout(req, res, next) {
  try {
    clearAuthCookies(res, process.env.NODE_ENV === "production");
    console.log("User logged out, cookies cleared");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    next(error);
  }
}

async function getUserStatus(req, res, next) {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        errors: "No user found with this ID"
      });
    }

    res.json({ exists: true });
  } catch (error) {
    next(error);
  }
}

async function followUser(req, res, next) {
  try {
    const { targetUserId } = req.body;
    const currentUserId = req.userId;

    if (!targetUserId) {
      return res.status(400).json({
        message: "Target user ID is required",
        errors: "Target user ID is required"
      });
    }

    if (targetUserId === currentUserId) {
      return res.status(400).json({
        message: "Cannot follow yourself",
        errors: "You cannot follow yourself"
      });
    }

    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found",
        errors: "Target user not found"
      });
    }

    const currentUser = await User.findById(currentUserId);

    if (currentUser.followers.includes(targetUserId)) {
      return res.status(400).json({
        message: "Already following",
        errors: "You are already following this user"
      });
    }

    await User.findByIdAndUpdate(targetUserId, {
      $addToSet: { followers: currentUserId }
    });

    res.status(200).json({
      message: "Successfully followed user"
    });
  } catch (error) {
    next(error);
  }
}

async function unfollowUser(req, res, next) {
  try {
    const { targetUserId } = req.body;
    const currentUserId = req.userId;

    if (!targetUserId) {
      return res.status(400).json({
        message: "Target user ID is required",
        errors: "Target user ID is required"
      });
    }

    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found",
        errors: "Target user not found"
      });
    }

    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: currentUserId }
    });

    res.status(200).json({
      message: "Successfully unfollowed user"
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { logout, getUserStatus, followUser, unfollowUser };
