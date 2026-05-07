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

async function me(req, res, next) {
  try {
    const user = await User.findById(req.userId).select("-verified -verificationCode -verificationCodeExpires -verificationCodeAttempts -banHistory");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        errors: "No user found with this ID"
      });
    }

    res.json(user);
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

// Users who follow the current user
async function getFollowers(req, res, next) {
  try {
    const userId = req.query.userId || req.userId;

    const user = await User.findById(userId).populate("followers", "username avatarUrl _id");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        errors: "No user found with this ID"
      });
    }

    const filteredFollowers = user.followers.filter(follower => follower._id.toString() !== userId);

    res.json({
      username: user.username,
      followers: filteredFollowers
    });
  } catch (error) {
    next(error);
  }
}

// Users that the current user follows
async function getFollowing(req, res, next) {
  try {
    const userId = req.query.userId || req.userId;
    const user = await User.findById(userId);
    
    const followingUsers = await User.find({
      followers: userId
    }).select("username avatarUrl _id");

    const filteredFollowing = followingUsers.filter(user => user._id.toString() !== userId);

    res.json({
      username: user.username,
      following: filteredFollowing
    });
  } catch (error) {
    next(error);
  }
}

async function getRecentUsers(req, res, next) {
  try {
    const users = await User.find({
      featured: true,
      $or: [
        { guest: false },
        { guest: { $exists: false } }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("avatarUrl username bio createdAt _id");

    const response = users.map(u => ({
      id: u._id,
      avatarUrl: u.avatarUrl || "",
      username: u.username,
      bio: u.bio || "",
      createdAt: u.createdAt
    }));

    res.json({ users: response });
  } catch (error) {
    next(error);
  }
}

async function updateFavUsers(req, res, next) {
  try {
    const { userIds } = req.body;
    const currentUserId = req.userId;

    if (!Array.isArray(userIds)) {
      return res.status(400).json({
        message: "userIds must be an array",
        errors: "userIds must be an array"
      });
    }

    const validUserIds = userIds.filter(id => id && id !== currentUserId);

    await User.findByIdAndUpdate(currentUserId, {
      $set: { favUsers: validUserIds }
    });

    const user = await User.findById(currentUserId).select("-verified -verificationCode -verificationCodeExpires -verificationCodeAttempts");

    res.status(200).json({
      message: "Favorite users updated successfully",
      user
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { logout, getUserStatus, followUser, unfollowUser, me, getFollowers, getFollowing, getRecentUsers, updateFavUsers };
