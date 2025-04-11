const mongoose = require("mongoose");

const guitarSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true,
  },
  shape: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
  series: {
    type: String,
    required: false,
  },
  pickups: {
    type: String,
    required: false,
  },
  trem: {
    type: String,
    required: false,
  },
  frets: {
    type: Number,
    required: false
  },
  tuners: {
    type: String,
    required: false,
  },
  colour: {
    type: String,
    required: false,
  },
  fretboard: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false
  },
  images: {
    type: [String],
    required: true
  }
})

module.exports = mongoose.model("Guitar", guitarSchema);