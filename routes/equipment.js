const { Guitar, Amp, Pedal, Equipment, Comments } = require("../models/equipment.js");
const { queryBuilder } = require("../query-builder.js");
const cloudinary = require("cloudinary").v2;

function getModelByType(type) {
  switch (type) {
    case "guitar":
      return Guitar;
    case "amp":
      return Amp;
    case "pedal":
      return Pedal;
    default:
      return null;
  }
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

async function get(req, res) {
  const type = (req.query.type || "guitar").toLowerCase();
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

  try {
    const items = await model.find().skip(skip).limit(limit);
    
    const itemsWithCommentCount = items.map(item => {
      const itemObject = item.toObject();
      itemObject.commentCount = item.comments ? item.comments.length : 0;
      delete itemObject.comments;
      return itemObject;
    });
    
    const total = await model.countDocuments();
    res.status(200).send({ 
      items: itemsWithCommentCount, 
      total, 
      page, 
      pages: Math.ceil(total / limit) 
    });
  } catch (err) {
    res.status(500).json({ 
      message: err.message,
      errors: "Failed to retrieve equipment data"
    });
  }
}

async function settings(req, res) {
  const type = (req.query.type || "guitar").toLowerCase();
  try {
    const settings = await getSettings(type);
    res.status(200).send({ settings });
  } catch (err) {
    res.status(500).json({ 
      message: err.message,
      errors: "Failed to retrieve settings"
    });
  }
}

async function getById(req, res) {
  const type = (req.query.type || "guitar").toLowerCase();
  const model = getModelByType(type);
  if (!model) {
    return res.status(400).send({ 
      message: "Invalid type", 
      errors: "Invalid equipment type provided"
    });
  }

  try {
    const item = await model.findById(req.query.id).populate({
      path: "comments",
      options: { sort: { date: -1 } }
    });
    if (!item) {
      return res.status(404).json({ 
        message: `${type} not found`,
        errors: `The requested ${type} could not be found`
      });
    }

    const itemWithCommentCount = item.toObject();
    itemWithCommentCount.commentCount = item.comments ? item.comments.length : 0;
    
    res.status(200).json({ item: itemWithCommentCount, settings: {} });
  } catch (err) {
    res.status(500).json({ 
      message: err.message,
      errors: "Failed to retrieve equipment details"
    });
  }
}

async function filter(req, res) {
  const type = (req.query.type || "guitar").toLowerCase();
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
    const items = await model.find(filter);
    res.status(200).send({ items });
  } catch (err) {
    res.status(500).json({ 
      message: err.message,
      errors: "Failed to filter equipment data"
    });
  }
}

async function add(req, res) {
  const type = (req.query.type || "guitar").toLowerCase();
  const model = getModelByType(type);
  if (!model) {
    return res.status(400).send({ 
      message: "Invalid type",
      errors: "Invalid equipment type provided"
    });
  }

  const newEquipment = new model(req.body);
  try {
    const savedEquipment = await newEquipment.save();
    console.log("Saved equipment: ", savedEquipment);
    res.status(201).json(savedEquipment);
  } catch (err) {
   
    res.status(400).json({ 
      message: err.message,
      errors: "Failed to save equipment"
    });
  }
}

async function update(req, res) {
  const type = (req.query.type || "guitar").toLowerCase();
  const model = getModelByType(type);
  if (!model) {
    return res.status(400).send({ 
      message: "Invalid type", 
      errors: "Invalid equipment type provided"
    });
  }

  try {
    const updatedEquipment = await model.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedEquipment) {
      return res.status(404).json({ 
        message: `${type} not found`,
        errors: `The ${type} you're trying to update could not be found`
      });
    }
    res.status(200).json(updatedEquipment);
  } catch (err) {    
    res.status(400).json({ 
      message: err.message,
      errors: "Failed to update equipment"
    });
  }
}

async function remove(req, res) {
  try {
    const itemToDelete = await Equipment.findById(req.params.id);
    if (!itemToDelete) {
      console.log("remove",5);
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
    res.status(500).json({ 
      message: err.message,
      errors: "Failed to delete equipment"
    });
  }
}

async function deleteImage(req, res) {
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
    res.status(500).json({ 
      message: err.message,
      errors: "Failed to delete image"
    });
  }
}

async function addComment(req, res) {
  try {
    const { equipmentId, username, text } = req.body;
    
    if (!equipmentId || !username || !text) {
      return res.status(400).json({ 
        message: "Missing required fields",
        errors: "Missing required fields - Equipment Id, Username, Comment text"
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
      username,
      text,
      date: new Date(new Date().toISOString())
    });

    const savedComment = await newComment.save();

    equipment.comments.push(savedComment._id);
    await equipment.save();

    res.status(201).json(savedComment);
  } catch (err) {
    res.status(500).json({ 
      message: err.message,
      errors: "Failed to add comment"
    });
  }
}

function getPublicIdFromUrl(url) {
  try {
    const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/;
    const match = url.match(regex);
    
    if (match && match[1]) {
      return match[1];
    }
    
    console.log("Regex extraction failed for URL:", url);
    const parts = url.split("/");
    const fileName = parts[parts.length - 1]; 
    return fileName.split(".")[0]; 
  } catch (err) {
    console.error("Error extracting public ID from URL:", err);
    return null;
  }
}

async function deleteCloudinaryImages(images) {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
  });

  try {
    const deletePromises = images.map((image) => {
      const publicId = getPublicIdFromUrl(image);
      console.log("publicid", publicId);
      
      if (publicId) {
        return cloudinary.uploader.destroy(publicId, { invalidate: true });
      }
      return Promise.resolve();
    });
    
    const results = await Promise.all(deletePromises);
    console.log(results);
    return results;
  } catch (err) {
    console.log({ message: err.message });
  }
}

module.exports = { get, getById, filter, update, remove, deleteImage, settings, add, addComment };