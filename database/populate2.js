const mongoose = require("mongoose");
const { Guitar, Amp, Pedal, Comments } = require("../models/equipment");
const User = require("../models/user");

const uri = "mongodb://localhost:27017/guitar-db";

// Generate sample users with realistic usernames
const users = [
  {
    username: "GuitarHero42",
    email: "guitarHero42@example.com",
    password: "password1",
  },
  {
    username: "RiffMaster",
    email: "riffmaster@example.com",
    password: "password2",
  },
  {
    username: "ToneSeeker",
    email: "toneseeker@example.com",
    password: "password3",
  },
  {
    username: "ShredQueen",
    email: "shredqueen@example.com",
    password: "password4",
  },
  {
    username: "BluesPicker",
    email: "bluespicker@example.com",
    password: "password5",
  },
];

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
  ampType: "Tube",
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
  colour: "Red",
  images: [],
}));

// Generate realistic comments
function generateComments(equipmentIds, userIds) {
  const comments = [];
  
  // Comment templates by user persona
  const commentTemplates = {
    "GuitarHero42": [
      "This thing absolutely shreds! Best purchase I've made all year.",
      "The tone is killer but the price is a bit steep. Worth it though!",
      "Plays like butter. My new go-to for recording sessions.",
      "Not as good as my custom shop model, but great value for money."
    ],
    "RiffMaster": [
      "Perfect for chunky metal riffs. The sustain is insane!",
      "Been using this for about 6 months now. Holds up well on tour.",
      "Solid build quality. Stays in tune even after heavy playing.",
      "A bit heavy for my taste, but the sound makes up for it."
    ],
    "ToneSeeker": [
      "The clarity in the high end is phenomenal. Very articulate.",
      "I've tried dozens of similar models and this one has the sweetest mid-range.",
      "Pairs perfectly with my tube amp setup. So responsive to dynamics!",
      "Subtle differences from the previous version, but definitely an upgrade in terms of tone."
    ],
    "ShredQueen": [
      "Fast neck, low action, what more could you ask for? Shredding machine!",
      "The fretwork is immaculate. No buzzing anywhere on the neck.",
      "Handles alternate tunings like a dream. No intonation issues.",
      "Love how it cuts through the mix during solos. My band is jealous!"
    ],
    "BluesPicker": [
      "Soulful warm tone that really sings. Perfect for those expressive bends.",
      "Has that vintage mojo you just can't find in most modern gear.",
      "Smooth as whiskey. The neck pickup is to die for.",
      "Responds beautifully to picking dynamics. You can whisper or scream with this thing."
    ]
  };
  
  equipmentIds.forEach(equipmentId => {
    // Add 1-3 comments for each equipment
    const commentCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < commentCount; i++) {
      // Select a random user to be the commenter
      const randomUserIndex = Math.floor(Math.random() * userIds.length);
      const user = users[randomUserIndex];
      const username = user.username;
      
      // Get appropriate comment templates for this user
      const templateOptions = commentTemplates[username] || 
        commentTemplates["ToneSeeker"]; // Default if username not found
      
      // Select a random template for this user
      const randomTemplateIndex = Math.floor(Math.random() * templateOptions.length);
      const commentText = templateOptions[randomTemplateIndex];
      
      // Generate a random date within the past year
      const now = new Date();
      const pastDate = new Date(now.setDate(now.getDate() - Math.floor(Math.random() * 365)));
      
      comments.push({
        equipmentId,
        userId: userIds[randomUserIndex],
        text: commentText,
        date: pastDate
      });
    }
  });
  
  return comments;
}

async function populateDatabase() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to database");

    // Drop the collections if they exist
    const collectionNames = ["equipment", "users", "comments"];
    for (const name of collectionNames) {
      const collections = await mongoose.connection.db.listCollections({ name }).toArray();
      if (collections.length > 0) {
        await mongoose.connection.db.dropCollection(name);
        console.log(`Collection '${name}' dropped`);
      }
    }

    // Insert users first to get their IDs
    const insertedUsers = await User.insertMany(users);
    console.log("Inserted users");
    const userIds = insertedUsers.map(user => user._id);

    // Assign a user to each equipment
    guitars.forEach((guitar, index) => {
      guitar.userId = userIds[index % userIds.length];
    });
    
    amps.forEach((amp, index) => {
      amp.userId = userIds[index % userIds.length];
    });
    
    pedals.forEach((pedal, index) => {
      pedal.userId = userIds[index % userIds.length];
    });

    // Insert equipment
    const insertedGuitars = await Guitar.insertMany(guitars);
    console.log("Inserted guitars");

    const insertedAmps = await Amp.insertMany(amps);
    console.log("Inserted amps");

    const insertedPedals = await Pedal.insertMany(pedals);
    console.log("Inserted pedals");

    // Combine all equipment IDs
    const equipmentIds = [
      ...insertedGuitars.map(g => g._id),
      ...insertedAmps.map(a => a._id),
      ...insertedPedals.map(p => p._id)
    ];

    // Generate and insert comments
    const comments = generateComments(equipmentIds, userIds);
    const insertedComments = await Comments.insertMany(comments);
    console.log("Inserted comments");

    // Update equipment documents with comment references
    const commentsByEquipment = {};
    insertedComments.forEach(comment => {
      const equipmentId = comment.equipmentId.toString();
      if (!commentsByEquipment[equipmentId]) {
        commentsByEquipment[equipmentId] = [];
      }
      commentsByEquipment[equipmentId].push(comment._id);
    });

    // Update each equipment with its comments
    for (const equipmentId in commentsByEquipment) {
      await mongoose.model("Equipment").findByIdAndUpdate(
        equipmentId,
        { $set: { comments: commentsByEquipment[equipmentId] } }
      );
    }

    console.log("Database populated successfully");
  } catch (err) {
    console.error("Error populating database:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database");
  }
}

populateDatabase();