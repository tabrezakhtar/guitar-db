const Schedule = require("../models/schedule");
const User = require("../models/user");
const { DateTime } = require("luxon");

// get individual users schedule
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
    const userId = req.userId;

    const updateData = {};
    if (timezone !== undefined) {
      updateData.timezone = timezone;
    }
    if (liveSchedules !== undefined) {
      updateData.liveSchedules = liveSchedules.map(schedule => ({
        ...schedule,
        title: schedule.title ? schedule.title.slice(0, 200) : "",
        description: schedule.description ? schedule.description.slice(0, 500) : "",
        endTime: schedule.endTime ? schedule.endTime : undefined
      }));
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
    const userId = req.userId;

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

const deleteScheduleItem = async (req, res) => {
  try {
    const { id } = req.body;
    const userId = req.userId;

    if (!id) {
      return res.status(400).json({ error: "Schedule item id is required" });
    }

    const schedule = await Schedule.findOneAndUpdate(
      { userId },
      { $pull: { liveSchedules: { _id: id } } },
      { new: true }
    );

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    res.json(schedule);
  } catch (error) {
    console.error("Error deleting schedule item:", error);
    res.status(500).json({ error: "Failed to delete schedule item" });
  }
};

// for the landing page
const getLiveAndUpcoming = async (req, res) => {
  try {
    const { timezone } = req.query;
    const query = {};
    if (timezone) {
      query.timezone = timezone;
    }

    const schedules = await Schedule.find(query).populate("userId", "username youtubeChannelAvatar");
    
    const liveNow = [];
    const upcoming = [];

    schedules.forEach(scheduleDoc => {
      if (!scheduleDoc.userId || !scheduleDoc.liveSchedules || scheduleDoc.liveSchedules.length === 0) {
        return;
      }

      const now = DateTime.now().setZone(scheduleDoc.timezone);
      const todayEnglishDay = now.toFormat("cccc");

      const matchingRule = scheduleDoc.liveSchedules.find(rule =>
        rule.day === todayEnglishDay
      );

      if (matchingRule) {
        const [hour, minute] = matchingRule.time.split(":").map(Number);
        const liveStartToday = now.set({ hour, minute, second: 0, millisecond: 0 });
        const liveEnd = liveStartToday.plus({ hours: 1 });

        if (now >= liveStartToday && now < liveEnd) {
          liveNow.push({
            userId: scheduleDoc.userId._id,
            username: scheduleDoc.userId.username,
            youtubeChannelAvatar: scheduleDoc.userId.youtubeChannelAvatar || "",
            timezone: scheduleDoc.timezone,
            startTime: liveStartToday.toISO(),
            endTime: matchingRule.endTime || null,
            title: matchingRule.title,
            description: matchingRule.description || "",
          });
          return;
        }
      }

      let cursor = now.startOf("day");
      for (let i = 0; i < 14; i++) {
        const dayName = cursor.toFormat("cccc");
        const rule = scheduleDoc.liveSchedules.find(r => r.day === dayName);
        if (rule) {
          const [h, m] = rule.time.split(":").map(Number);
          const candidate = cursor.set({ hour: h, minute: m });
          if (candidate > now && candidate.diff(now, "hours").hours <= 6) {
            upcoming.push({
              userId: scheduleDoc.userId._id,
              username: scheduleDoc.userId.username,
              youtubeChannelAvatar: scheduleDoc.userId.youtubeChannelAvatar || "",
              timezone: scheduleDoc.timezone,
              startTime: candidate.toISO(),
              day: dayName,
              time: rule.time,
              title: rule.title,
              description: rule.description || "",
              endTime: rule.endTime || null
            });
            return;
          }
        }
        cursor = cursor.plus({ days: 1 });
      }
    });

    res.json({ liveNow, upcoming });
  } catch (error) {
    console.error("Error fetching live and upcoming:", error);
    res.status(500).json({ error: "Failed to fetch live and upcoming schedules" });
  }
};

const getWeeklySchedule = async (req, res) => {
  try {
    const schedules = await Schedule.find({}).populate("userId", "username youtubeChannelAvatar youtubeChannelBanner");
    
    const weeklySchedules = [];

    schedules.forEach(scheduleDoc => {
      if (!scheduleDoc.userId || !scheduleDoc.liveSchedules || scheduleDoc.liveSchedules.length === 0) {
        return;
      }

      const now = DateTime.now().setZone(scheduleDoc.timezone);
      const startOfWeek = now.startOf("week");
      const endOfWeek = startOfWeek.plus({ days: 7 });

      scheduleDoc.liveSchedules.forEach(rule => {
        let cursor = startOfWeek;
        for (let i = 0; i < 7; i++) {
          const dayName = cursor.toFormat("cccc");
          if (rule.day === dayName) {
            const [h, m] = rule.time.split(":").map(Number);
            const scheduledTime = cursor.set({ hour: h, minute: m, second: 0, millisecond: 0 });
            
            weeklySchedules.push({
              userId: scheduleDoc.userId._id,
              username: scheduleDoc.userId.username,
              youtubeChannelAvatar: scheduleDoc.userId.youtubeChannelAvatar || "",
              youtubeChannelBanner: scheduleDoc.userId.youtubeChannelBanner || "",
              timezone: scheduleDoc.timezone,
              day: dayName,
              time: rule.time,
              scheduledTime: scheduledTime.toISO(),
              title: rule.title,
              description: rule.description || "",
              endTime: rule.endTime || null
            });
          }
          cursor = cursor.plus({ days: 1 });
        }
      });
    });

    weeklySchedules.sort((a, b) => 
      new Date(a.scheduledTime) - new Date(b.scheduledTime)
    );

    res.json({ schedules: weeklySchedules });
  } catch (error) {
    console.error("Error fetching weekly schedule:", error);
    res.status(500).json({ error: "Failed to fetch weekly schedule" });
  }
};

module.exports = {
  getSchedule,
  updateSchedule,
  deleteSchedule,
  deleteScheduleItem,
  getLiveAndUpcoming,
  getWeeklySchedule
};
