const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  timezone: {
    type: String,
    required: true,
    default: "UTC"
  },
  liveSchedules: [
    {
      day: {
        type: String,
        enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        required: true
      },
      time: {
        type: String,
        required: true,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/
      }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model("Schedule", ScheduleSchema);
