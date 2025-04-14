const Guitar = require("../models/guitar");
const { queryBuilder } = require("../query-builder.js");
const cloudinary = require('cloudinary').v2;

async function getSettings() {
  const settings = await Guitar.aggregate(
    [
      {
        $group:
          {
            _id: 1,
            brand: { $addToSet: "$brand" },
            colours: { $addToSet: "$colour" },
            pickups: { $addToSet: "$pickups" },
            tremolo: { $addToSet: "$tremolo" },
            fretboard: { $addToSet: "$fretboard" }
          }
      }
    ]
 )

 return settings[0];
}

async function get(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  console.log("Page: ", page);
  console.log("Limit: ", limit);
  const skip = (page - 1) * limit;

  try {
    const guitars = await Guitar.find().skip(skip).limit(limit);
    const total = await Guitar.countDocuments();
    const settings = await getSettings();
    res.status(200).send({ guitars, settings, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getById(req, res) {
  try {
    const guitar = await Guitar.findById(req.query.id);
    const settings = await getSettings();
    if (!guitar) {
      return res.status(404).json({ message: "Guitar not found" });
    }
    res.status(200).json({guitar, settings});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function filter(req, res) {
  let filter = {};

  if (req.query.filter) {
    filter = queryBuilder(decodeURI(req.query.filter));
  }

  try {
    const guitars = await Guitar.find(filter);
    const settings = await getSettings();
    res.status(200).send({ guitars, settings });
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

async function create(req, res) {
  const guitar = new Guitar(req.body);

  try {
    const newGuitar = await guitar.save();
    res.status(201).json(newGuitar);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function update(req, res) {
  console.log("Update Guitar");
  console.log(req.params.id);
  console.log(req.body);
  try {
    const updatedGuitar = await Guitar.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedGuitar) {
      return res.status(404).json({ message: "Guitar not found" });
    }
    res.status(200).json(updatedGuitar);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function remove(req, res) {
  try {
    const guitarToDelete = await Guitar.findById(req.params.id);
    if (!guitarToDelete) {
      return res.status(404).json({ message: "Guitar not found" });
    }
    await deleteCloudinaryImages(guitarToDelete.images);
    await guitarToDelete.deleteOne();
    res.status(200).json({ message: "Guitar deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function deleteImage(req, res) {
  try {
    const guitar = await Guitar.findById(req.params.id);
    if (!guitar) {
      return res.status(404).json({ message: "Guitar not found" });
    }

    const imageToDelete = guitar.images.find((image) => image === req.body.imageUrl);
    console.log("Image to delete: ", imageToDelete);
    await deleteCloudinaryImages([imageToDelete]);
    console.log(5)
    res.status(200).json({ message: "Image deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

function getPublicIdFromUrl(url) {
  // Remove the base URL and delivery type
  const regex = /https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/(?:v\d+\/)?(.+?)(\.\w+)?$/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

async function deleteCloudinaryImages(images) {
  console.log("Delete Cloudinary Images");
  console.log(images);
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  });

  try {
    const deletePromises = images.map((image) =>
      cloudinary.uploader.destroy(getPublicIdFromUrl(image))
    );

    await Promise.all(deletePromises);
  } catch (err) {
    console.log({ message: err.message });
  }
}

module.exports = { get, getById, filter, create, update, remove, deleteImage };