require("dotenv").config();
const User = require("../models/user");
const { Comments, Equipment } = require("../models/equipment.js");
const { deleteCloudinaryImages } = require("../helpers/cloudinary");

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

module.exports = { getUserProfile, updateUserProfile, deleteUserAvatar };