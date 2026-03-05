require("dotenv").config();
const User = require("../models/user");
const { Comments, Equipment } = require("../models/equipment.js");
const { deleteCloudinaryImages } = require("../helpers/cloudinary");
const { clearAuthCookies } = require("../helpers/cookies");
const { saveYoutubeChannel } = require("./youtube");

async function getUserProfile(req, res, next) {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
        errors: "User ID is required"
      });
    }

    const user = await User.findById(userId)
      .select("username bio location website createdAt admin avatarUrl followers favUsers youtubeChannelId youtubeChannelTitle youtubeChannelHandle youtubeChannelAvatar youtubeChannelUrl roles")
      .populate("followers", "_id username");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        errors: "No user found with this ID"
      });
    }

    const following = await User.find({ followers: userId }).select("_id username");

    const userResponse = {
      _id: user._id,
      username: user.username,
      bio: user.bio,
      location: user.location,
      website: user.website,
      createdAt: user.createdAt,
      avatarUrl: user.avatarUrl,
      followers: user.followers,
      following: following,
      favUsers: user.favUsers || [],
      youtubeChannelId: user.youtubeChannelId || null,
      youtubeChannelTitle: user.youtubeChannelTitle || "",
      youtubeChannelHandle: user.youtubeChannelHandle || "",
      youtubeChannelAvatar: user.youtubeChannelAvatar || "",
      youtubeChannelUrl: user.youtubeChannelUrl || "",
      roles: user.roles
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
        select: "_id username avatarUrl roles"
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

  const { _id, username, bio, location, website, avatarUrl, youtubeChannelUrl, visibility } = req.body;

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
    if (visibility !== undefined) user.visibility = visibility;

    if (youtubeChannelUrl !== undefined) {
      if (youtubeChannelUrl === "") {
        user.youtubeChannelUrl = "";
        user.youtubeChannelId = null;
        user.youtubeChannelHandle = "";
        user.youtubeChannelTitle = "";
        user.youtubeChannelAvatar = "";
        user.uploadsPlaylistId = null;
      } else {
        await user.save();
        
        const youtubeReq = {
          body: { url: youtubeChannelUrl },
          userId: _id
        };
        const youtubeRes = {
          status: (code) => ({
            json: (data) => {
              if (code !== 200) {
                throw new Error(data.errors || data.message || "YouTube channel save failed");
              }
              return data;
            }
          })
        };
        
        try {
          await saveYoutubeChannel(youtubeReq, youtubeRes, (err) => {
            if (err) throw err;
          });
          user = await User.findById(_id);
        } catch (youtubeError) {
          return res.status(400).json({
            message: "Failed to save YouTube channel",
            errors: youtubeError.message || "Invalid YouTube URL or channel not found"
          });
        }
      }
    }

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
        avatarUrl: user.avatarUrl,
        youtubeChannelId: user.youtubeChannelId || null,
        youtubeChannelTitle: user.youtubeChannelTitle || "",
        youtubeChannelHandle: user.youtubeChannelHandle || "",
        youtubeChannelAvatar: user.youtubeChannelAvatar || "",
        youtubeChannelUrl: user.youtubeChannelUrl || "",
        uploadsPlaylistId: user.uploadsPlaylistId || null,
        visibility: user.visibility ?? 0
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

    clearAuthCookies(res, process.env.NODE_ENV === "production");

    res.status(200).json({
      message: "User profile deleted successfully",
      deletedImages: imagesToDelete.length,
      deletedEquipment: userEquipment.length
    });
  } catch (error) {
    next(error);
  }
}


module.exports = { getUserProfile, updateUserProfile, deleteUserAvatar, deleteUserProfile };
