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
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        required: true
      },
      time: {
        type: String,
        required: true,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/
      },
      endTime: {
        type: String,
        required: false,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/
      },
      title: {
        type: String,
        default: ""
      },
      description: {
        type: String,
        default: ""
      }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model("Schedule", ScheduleSchema);
