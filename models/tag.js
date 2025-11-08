const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  colour: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: () => new Date(new Date().toISOString())
  }
});

const Tag = mongoose.model("Tag", tagSchema);

module.exports = Tag;
