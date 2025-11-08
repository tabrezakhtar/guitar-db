const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ["error", "info"],
    required: true,
    default: "info"
  },
  
  message: {
    type: String,
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  action: String,

  relatedId: String,

  error: {
    message: String,
    stack: String
  },

  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  capped: { size: 52428800 }
});


logSchema.statics.logError = function(error, userId = null, action = null) {
  return this.create({
    level: "error",
    message: error.message || "Unknown error",
    userId,
    action,
    error: {
      message: error.message,
      stack: error.stack
    }
  });
};

logSchema.statics.logAction = function(message, userId, action, relatedId = null) {
  return this.create({
    level: "info",
    message,
    userId,
    action,
    relatedId
  });
};

module.exports = mongoose.model("Log", logSchema);

