const { Guitar, Amp, Pedal, Bass, Acoustic, Accessory, Equipment, Comments } = require("../models/equipment.js");
const { queryBuilder } = require("../query-builder.js");
const { deleteCloudinaryImages } = require("../helpers/cloudinary");
const Tag = require("../models/tag");

function getModelByType(type) {
  switch (type) {
    case "guitar":
      return Guitar;
    case "acoustic":
      return Acoustic;
    case "amp":
      return Amp;
    case "pedal":
      return Pedal;
    case "bass":
      return Bass;
    case "accessory":
      return Accessory;
    case "":
    case null:
    case undefined:
      return Equipment;
    default:
      return null;
  }
}

function processEquipmentItems(items, keepData = false) {
  if (Array.isArray(items)) {
    return items.map(item => processEquipmentItem(item, keepData));
  }
  return processEquipmentItem(items, keepData);
}

function processEquipmentItem(item, keepData = false) {
  if (!item) return null;

  const itemObject = item.toObject ? item.toObject() : { ...item };

  itemObject.commentCount = item.comments ? item.comments.length : 0;
  itemObject.likesCount = item.likes ? item.likes.length : 0;

  // Process user object to conditionally include admin field
  if (itemObject.user && typeof itemObject.user === 'object') {
    const processedUser = {
      _id: itemObject.user._id,
      username: itemObject.user.username,
      avatarUrl: itemObject.user.avatarUrl
    };

    // Only include admin if it's true
    if (itemObject.user.admin === true) {
      processedUser.admin = itemObject.user.admin;
    }

    itemObject.user = processedUser;
  }

  // Process comments array to conditionally include admin field for comment users
  if (itemObject.comments && Array.isArray(itemObject.comments)) {
    itemObject.comments = itemObject.comments.map(comment => {
      if (comment.user && typeof comment.user === 'object') {
        const processedCommentUser = {
          _id: comment.user._id,
          username: comment.user.username,
          avatarUrl: comment.user.avatarUrl
        };

        // Only include admin if it's true
        if (comment.user.admin === true) {
          processedCommentUser.admin = comment.user.admin;
        }

        return {
          ...comment,
          user: processedCommentUser
        };
      }
      return comment;
    });
  }

  if (!keepData) {
    delete itemObject.likes;
  }

  return itemObject;
}

async function getSettings(type) {
  const model = getModelByType(type);
  if (!model) {
    throw new Error("Invalid type");
  }

  const settings = await model.aggregate([
    {
      $group: {
        _id: 1,
        brand: { $addToSet: "$brand" },
        colours: { $addToSet: "$colour" },
        pickups: { $addToSet: "$pickups" },
        tremolo: { $addToSet: "$tremolo" },
        fretboard: { $addToSet: "$fretboard" }
      }
    }
  ]);

  return settings[0];
}

async function get(req, res, next) {
  const type = req.query.type ? req.query.type.toLowerCase() : "";
  const model = getModelByType(type);
  if (!model) {
    return res.status(400).send({
      message: "Invalid type",
      errors: "Invalid equipment type provided"
    });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const sortBy = req.query.sortBy || "date";
  const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

  const sort = {};
  sort[sortBy] = sortOrder;
  if (sortBy !== "_id") {
    sort["_id"] = sortOrder;
  }

  try {
    let query = {};

    if (req.query.tags) {
      try {
        const tags = JSON.parse(req.query.tags);
        if (Array.isArray(tags) && tags.length > 0) {
          query.tags = { $in: tags };
        }
      } catch (err) {
        console.error("Error parsing tags parameter:", err);
      }
    }

    const items = await model.find(query)
      .collation({ locale: "en", strength: 2 })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("tags")
      .populate({
        path: "user",
        select: "username avatarUrl -_id"
      });

    const processedItems = processEquipmentItems(items);

    const total = await model.countDocuments(query);
    res.status(200).send({
      items: processedItems,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
}

async function searchByText(req, res, next) {
  const text = req.query.q ? req.query.q.trim() : "";
  const sortBy = req.query.sortBy || "date";
  const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;
  if (!text) {
    return res.status(400).json({
      message: "Search text is required",
      errors: "No search text provided"
    });
  }

  try {
    const regex = new RegExp(text, "i");
    const items = await Equipment.find({
      $or: [
        { name: { $regex: regex } },
        { brand: { $regex: regex } }
      ]
    })
      .sort({ [sortBy]: sortOrder })
      .populate("tags")
      .populate({
        path: "user",
        select: "username avatarUrl admin -_id"
      });

    const processedItems = processEquipmentItems(items);
    res.status(200).json({ items: processedItems });
  } catch (err) {
    next(err);
  }
}

async function settings(req, res, next) {
  const type = req.query.type ? req.query.type.toLowerCase() : "";
  try {
    const settings = await getSettings(type);
    res.status(200).send({ settings });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  const type = req.query.type ? req.query.type.toLowerCase() : "";
  const model = getModelByType(type);
  if (!model) {
    return res.status(400).send({
      message: "Invalid type",
      errors: "Invalid equipment type provided"
    });
  }

  try {
    const item = await model.findById(req.query.id)
      .populate({
        path: "comments",
        options: { sort: { date: -1 } },
        populate: {
          path: "user",
          select: "_id username avatarUrl admin"
        }
      })
      .populate("tags")
      .populate({
        path: "user",
        select: "_id username avatarUrl admin"
      });

    if (!item) {
      return res.status(404).json({
        message: `${type} not found`,
        errors: `The requested ${type} could not be found`
      });
    }

    const processedItem = processEquipmentItem(item, true);
    res.status(200).json({ item: processedItem, settings: {} });
  } catch (err) {
    next(err);
  }
}

async function getByUser(req, res, next) {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({
        message: "Missing user ID",
        errors: "User ID is required"
      });
    }

    const sortBy = req.query.sortBy || "date";
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

    let query = { user: userId };

    if (req.query.type) {
      const type = req.query.type.toLowerCase();
      if (["guitar", "acoustic", "amp", "pedal", "bass", "accessory"].includes(type)) {
        query.__t = type.charAt(0).toUpperCase() + type.slice(1);
      }
    }

    if (req.query.tags) {
      try {
        const tags = JSON.parse(req.query.tags);
        if (Array.isArray(tags) && tags.length > 0) {
          query.tags = { $in: tags };
        }
      } catch (err) {
        console.error("Error parsing tags parameter:", err);
      }
    }

    const items = await Equipment.find(query)
      .collation({ locale: "en", strength: 2 })
      .sort({ [sortBy]: sortOrder })
      .populate("tags")
      .populate({
        path: "user",
        select: "_id username avatarUrl admin"
      });

    const itemsWithCommentCount = processEquipmentItems(items);

    const total = await Equipment.countDocuments(query);
    res.status(200).send({
      items: itemsWithCommentCount,
      total,
    });
  } catch (err) {
    next(err);
  }
}

async function filter(req, res, next) {
  const type = req.query.type ? req.query.type.toLowerCase() : "";
  const model = getModelByType(type);
  if (!model) {
    return res.status(400).send({
      message: "Invalid type",
      errors: "Invalid equipment type provided"
    });
  }

  let filter = {};

  if (req.query.filter) {
    filter = queryBuilder(decodeURI(req.query.filter));
  }

  try {
    const items = await model.find(filter)
      .populate("tags")
      .populate({
        path: "user",
        select: "_id username avatarUrl admin"
      });

    const processedItems = processEquipmentItems(items);
    res.status(200).send({ items: processedItems });
  } catch (err) {
    next(err);
  }
}

async function add(req, res, next) {
  const type = req.query.type ? req.query.type.toLowerCase() : "";
  const model = getModelByType(type);
  if (!model) {
    return res.status(400).send({
      message: "Invalid type",
      errors: "Invalid equipment type provided"
    });
  }

  const newEquipment = new model({
    ...req.body,
    user: req.userId
  });

  try {
    const savedEquipment = await newEquipment.save();

    const populatedEquipment = await model.findById(savedEquipment._id)
      .populate("tags")
      .populate({
        path: "user",
        select: "_id username avatarUrl admin"
      });

    const processedItem = processEquipmentItem(populatedEquipment);

    console.log("Saved equipment: ", processedItem);
    res.status(201).json(processedItem);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  const type = req.query.type ? req.query.type.toLowerCase() : "";
  const model = getModelByType(type);
  if (!model) {
    return res.status(400).send({
      message: "Invalid type",
      errors: "Invalid equipment type provided"
    });
  }

  try {
    const updatedEquipment = await model.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("tags")
      .populate("comments")
      .populate({
        path: "user",
        select: "_id username avatarUrl admin"
      });

    if (!updatedEquipment) {
      return res.status(404).json({
        message: `${type} not found`,
        errors: `The ${type} you're trying to update could not be found`
      });
    }

    const itemObject = processEquipmentItem(updatedEquipment, true);

    res.status(200).json(itemObject);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const itemToDelete = await Equipment.findById(req.params.id);
    if (!itemToDelete) {
      return res.status(404).json({
        message: "Equipment not found",
        errors: "The equipment you're trying to delete could not be found"
      });
    }

    if (itemToDelete.images && itemToDelete.images.length > 0) {
      await deleteCloudinaryImages(itemToDelete.images);
    }
    await itemToDelete.deleteOne();
    res.status(200).json({ message: "Equipment deleted successfully" });
  } catch (err) {
    next(err);
  }
}

async function deleteImage(req, res, next) {
  try {
    const item = await Equipment.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        message: "Equipment not found",
        errors: "The equipment associated with this image could not be found"
      });
    }

    const imageToDelete = item.images.find((image) => image === req.body.imageUrl);
    console.log("Image to delete: ", imageToDelete);

    if (!imageToDelete) {
      return res.status(404).json({
        message: "Image not found",
        errors: "The specified image URL could not be found"
      });
    }

    await deleteCloudinaryImages([imageToDelete]);
    item.images = item.images.filter((image) => image !== req.body.imageUrl);
    await item.save();
    res.status(200).json({ message: "Image deleted successfully" });
  } catch (err) {
    next(err);
  }
}

async function addComment(req, res, next) {
  try {
    const { equipmentId, text } = req.body;

    if (!equipmentId || !text) {
      return res.status(400).json({
        message: "Missing required fields",
        errors: "Missing required fields - Equipment Id, Comment text"
      });
    }

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({
        message: "Equipment not found",
        errors: "The specified equipment could not be found"
      });
    }

    const newComment = new Comments({
      equipmentId,
      user: req.userId,
      text,
      date: new Date(new Date().toISOString())
    });

    const savedComment = await newComment.save();

    equipment.comments.push(savedComment._id);
    await equipment.save();

    const populatedComment = await Comments.findById(savedComment._id)
      .populate({
      path: "user",
      select: "_id username avatarUrl admin"
      });

    res.status(201).json(populatedComment);
  } catch (err) {
    next(err);
  }
}

async function deleteComment(req, res, next) {
  try {
    const comment = req.comment;
    const equipmentId = comment.equipmentId;

    const equipment = await Equipment.findById(equipmentId);
    if (equipment) {
      equipment.comments = equipment.comments.filter(
        commentId => commentId.toString() !== comment._id.toString()
      );
      await equipment.save();
    }

    await Comments.findByIdAndDelete(comment._id);

    res.status(200).json({
      message: "Comment deleted successfully",
      commentId: comment._id
    });
  } catch (err) {
    next(err);
  }
}

async function toggleLike(req, res, next) {
  try {
    const equipmentId = req.params.id;
    const userId = req.userId;

    const equipment = await Equipment.findById(equipmentId);

    if (!equipment) {
      return res.status(404).json({
        message: "Equipment not found",
        errors: "The equipment you're trying to like could not be found"
      });
    }

    if (equipment.user.toString() === userId) {
      return res.status(400).json({
        message: "Cannot like your own equipment",
        errors: "You cannot like your own equipment"
      });
    }

    const likeIndex = equipment.likes.findIndex(
      like => like.toString() === userId
    );

    if (likeIndex === -1) {
      equipment.likes.push(userId);
    } else {
      equipment.likes.splice(likeIndex, 1);
    }

    await equipment.save();

    res.status(200).json({
      message: likeIndex === -1 ? "Equipment liked" : "Equipment unliked",
      likes: equipment.likes.length
    });
  } catch (err) {
    next(err);
  }
}

async function getAllTags(req, res, next) {
  try {
    const tags = await Tag.find()
      .collation({ locale: "en", strength: 2 })
      .sort({ name: 1 });
    res.status(200).json({ tags });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  get,
  getById,
  getByUser,
  filter,
  update,
  remove,
  deleteImage,
  settings,
  add,
  addComment,
  deleteComment,
  getAllTags,
  toggleLike,
  searchByText
};
