const mongoose = require("mongoose");

const livestreamSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  streams: [{
    title: String,
    videoId: String,
    publishedAt: Date,
    thumbnail: String,
    url: String,
    status: String
  }],
  cachedAt: {
    type: Date,
    default: Date.now
  }
});

const Livestream = mongoose.model("Livestream", livestreamSchema);

module.exports = Livestream;
