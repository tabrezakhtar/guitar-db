const Schedule = require("../models/schedule");

const getSchedule = async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const schedule = await Schedule.findOne({ userId });
    
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    res.json(schedule);
  } catch (error) {
    console.error("Error fetching schedule:", error);
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const { timezone, liveSchedules } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (timezone !== undefined) {
      updateData.timezone = timezone;
    }
    if (liveSchedules !== undefined) {
      updateData.liveSchedules = liveSchedules;
    }

    const schedule = await Schedule.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json(schedule);
  } catch (error) {
    console.error("Error updating schedule:", error);
    res.status(500).json({ error: "Failed to update schedule" });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Schedule.findOneAndDelete({ userId });
    
    if (!result) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    res.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    res.status(500).json({ error: "Failed to delete schedule" });
  }
};

module.exports = {
  getSchedule,
  updateSchedule,
  deleteSchedule
};
