const mongoose = require("mongoose");
const User = require("../models/user");
const Schedule = require("../models/schedule");
const { faker } = require("@faker-js/faker");

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function getRandomTime() {
  const hour = faker.number.int({ min: 0, max: 23 });
  const minute = faker.number.int({ min: 0, max: 59 });
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

function calculateEndTime(startTime, hoursToAdd) {
  const [hours, minutes] = startTime.split(":").map(Number);
  const newHours = (hours + hoursToAdd) % 24;
  return `${String(newHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getRandomDays(count) {
  const shuffled = [...days].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateTitle() {
  const title = faker.lorem.sentence({ min: 3, max: 10 });
  return title.length > 200 ? title.substring(0, 200) : title;
}

function generateDescription() {
  const description = faker.lorem.paragraphs({ min: 1, max: 3 });
  return description.length > 500 ? description.substring(0, 500) : description;
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

      const liveSchedules = selectedDays.map(day => {
        const startTime = getRandomTime();
        const durationHours = faker.number.int({ min: 1, max: 2 });
        const endTime = calculateEndTime(startTime, durationHours);
        
        return {
          day,
          time: startTime,
          endTime,
          title: generateTitle(),
          description: generateDescription()
        };
      });

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
