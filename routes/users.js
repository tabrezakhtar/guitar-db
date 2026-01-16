require("dotenv").config();
const User = require("../models/user");
const { Comments, Equipment } = require("../models/equipment.js");
const { deleteCloudinaryImages } = require("../helpers/cloudinary");
const cookie = require("cookie");

async function getUserProfile(req, res, next) {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
        errors: "User ID is required"
      });
    }

    const user = await User.findById(userId).select("username bio location website createdAt admin avatarUrl");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        errors: "No user found with this ID"
      });
    }

    // Build user response object, only include admin if it's true
    const userResponse = {
      _id: user._id,
      username: user.username,
      bio: user.bio,
      location: user.location,
      website: user.website,
      createdAt: user.createdAt,
      avatarUrl: user.avatarUrl
    };

    if (user.admin === true) {
      userResponse.admin = user.admin;
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

    res.json({ user: userResponse, comments: recentComments, likedEquipment });
  } catch (error) {
    next(error);
  }
}

async function updateUserProfile(req, res, next) {
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
    next(error);
  }
}

async function deleteUserAvatar(req, res, next) {
  if (!req.body || !req.body.userId || !req.body.avatarUrl) {
    return res.status(400).json({
      message: "AvatarUrl is required",
      errors: "User Id is required.  AvatarUrl is required"
    });
  }

  const { avatarUrl, userId } = req.body;

  try {
    const user = await User.findById(userId);

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
    next(error);
  }
}

async function deleteUserProfile(req, res, next) {
  if (!req.body || !req.body.userId) {
    return res.status(400).json({
      message: "User ID is required",
      errors: "User ID is required"
    });
  }

  const { userId } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        errors: "No user found with this ID"
      });
    }

    const imagesToDelete = [];

    if (user.avatarUrl) {
      imagesToDelete.push(user.avatarUrl);
    }

    const userEquipment = await Equipment.find({ user: userId });
    userEquipment.forEach(equipment => {
      if (equipment.images && equipment.images.length > 0) {
        imagesToDelete.push(...equipment.images);
      }
    });

    if (imagesToDelete.length > 0) {
      try {
        await deleteCloudinaryImages(imagesToDelete);
      } catch (cloudinaryError) {
        console.error("Error deleting images from Cloudinary:", cloudinaryError);
      }
    }

    await Equipment.deleteMany({ user: userId });

    await Comments.deleteMany({ user: userId });

    await Equipment.updateMany(
      { likes: userId },
      { $pull: { likes: userId } }
    );

    await User.findByIdAndDelete(userId);

    // http invalidate cookies
    res.setHeader("Set-Cookie", [
      cookie.serialize("accessToken", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
        path: "/",
        sameSite: "strict"
      }),
      cookie.serialize("refreshToken", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
        path: "/",
        sameSite: "strict"
      })
    ]);

    res.status(200).json({
      message: "User profile deleted successfully",
      deletedImages: imagesToDelete.length,
      deletedEquipment: userEquipment.length
    });
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

module.exports = { getUserProfile, updateUserProfile, deleteUserAvatar, deleteUserProfile, getUserStatus };
