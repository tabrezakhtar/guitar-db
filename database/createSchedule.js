const mongoose = require("mongoose");
const User = require("../models/user");
const Schedule = require("../models/schedule");

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function getRandomTime() {
  const hour = Math.floor(Math.random() * 24).toString().padStart(2, "0");
  const minute = Math.floor(Math.random() * 60).toString().padStart(2, "0");
  return `${hour}:${minute}`;
}

function getRandomDays(count) {
  const shuffled = [...days].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

async function createSchedules() {
  try {
    const connectionstring = "localhost:27017/guitar-db"; 
    await mongoose.connect(connectionstring);
    console.log("Connected to MongoDB");

    const users = await User.find({
      $or: [
        { guest: false },
        { guest: { $exists: false } }
      ]
    });
    console.log(`Found ${users.length} non-guest users`);

    let created = 0;
    let updated = 0;

    for (const user of users) {
      const numSchedules = Math.random() < 0.5 ? 1 : 2;
      const selectedDays = getRandomDays(numSchedules);
      const timezone = Math.random() < 0.5 ? "America/New_York" : "Europe/London";

      const liveSchedules = selectedDays.map(day => ({
        day,
        time: getRandomTime()
      }));

      const existing = await Schedule.findOne({ userId: user._id });
      
      await Schedule.updateOne(
        { userId: user._id },
        {
          userId: user._id,
          timezone,
          liveSchedules
        },
        { upsert: true }
      );

      if (existing) {
        updated++;
        console.log(`Updated schedule for ${user.username}`);
      } else {
        created++;
        console.log(`Created schedule for ${user.username}`);
      }
    }

    console.log(`\nDone! Created: ${created}, Updated: ${updated}`);
    await mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

createSchedules();
