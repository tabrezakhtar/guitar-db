const mongoose = require("mongoose");
const { Guitar, Amp, Pedal } = require("../models/equipment");

const uri = "mongodb://localhost:27017/guitar-db";

const guitars = Array.from({ length: 10 }, (_, i) => ({
  name: `Guitar ${i + 1}`,
  brand: `Brand ${i + 1}`,
  price: `${1000 + i * 100}`,
  type: "guitar",
  description: `Description for Guitar ${i + 1}`,
  strings: 6,
  shape: "Stratocaster",
  pickups: "Single-Coil",
  colour: "Sunburst",
  images: [],
}));

const amps = Array.from({ length: 10 }, (_, i) => ({
  name: `Amp ${i + 1}`,
  brand: `Brand ${i + 1}`,
  price: `${500 + i * 50}`,
  type: "amp",
  description: `Description for Amp ${i + 1}`,
  power: 50 + i * 10,
  tubeType: "12AX7",
  colour: "Black",
  images: [],
}));

const pedals = Array.from({ length: 10 }, (_, i) => ({
  name: `Pedal ${i + 1}`,
  brand: `Brand ${i + 1}`,
  price: `${200 + i * 20}`,
  type: "pedal",
  description: `Description for Pedal ${i + 1}`,
  effectType: "Overdrive",
  controls: ["Gain", "Tone", "Level"],
  colour: "Red",
  images: [],
}));

async function populateDatabase() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to database");

    // Drop the Equipment collection if it exists
    const collections = await mongoose.connection.db.listCollections({ name: "equipment" }).toArray();
    if (collections.length > 0) {
      await mongoose.connection.db.dropCollection("equipment");
      console.log("Collection 'equipment' dropped");
    }

    // Insert data into the Equipment collection
    await Guitar.insertMany(guitars);
    console.log("Inserted guitars");

    await Amp.insertMany(amps);
    console.log("Inserted amps");

    await Pedal.insertMany(pedals);
    console.log("Inserted pedals");

    console.log("Database populated successfully");
  } catch (err) {
    console.error("Error populating database:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database");
  }
}

populateDatabase();