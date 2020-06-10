const mongoose = require('mongoose')

const guitarSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true,
    lowercase: true
  },
  style: {
    type: String,
    required: false,
    lowercase: true
  },
  name: {
    type: String,
    required: false,
    lowercase: true
  },
  series: {
    type: String,
    required: false,
    lowercase: true
  },
  pickups: {
    type: String,
    required: false,
    lowercase: true
  },
  trem: {
    type: String,
    required: false,
    lowercase: true
  },
  frets: {
    type: Number,
    required: false
  },
  tuners: {
    type: String,
    required: false,
    lowercase: true
  },
  colour: {
    type: String,
    required: false,
    lowercase: true
  },
  fretboard: {
    type: String,
    required: false,
    lowercase: true
  },
  description: {
    type: String,
    required: false
  }
})

module.exports = mongoose.model('Guitar', guitarSchema)