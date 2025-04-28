const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { Guitar, Amp, Pedal, Comments } = require("../models/equipment");
const User = require("../models/user");

const uri = "mongodb://localhost:27017/guitar-db";

// Load data from JSON files
function loadJsonFile(filename) {
  const filePath = path.join(__dirname, "data", filename);
  const fileContent = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileContent);
}

const users = loadJsonFile("users.json");
const guitars = loadJsonFile("guitars.json");
const amps = loadJsonFile("amps.json").map(amp => {
  // Convert "N/A" power values to null to avoid schema validation errors
  if (amp.power === "N/A") {
    amp.power = null;
  }
  return amp;
});
const pedals = loadJsonFile("pedals.json");

// Generate realistic comments
function generateComments(equipmentIds, userIds) {
  const comments = [];
  
  // Comment templates by user persona
  const commentTemplates = {
    "GuitarHero42": [
      "This thing absolutely shreds! Best purchase I've made all year.",
      "The tone is killer but the price is a bit steep. Worth it though!",
      "Plays like butter. My new go-to for recording sessions.",
      "Not as good as my custom shop model, but great value for money.",
      "Used this on my latest studio session and the producer loved the tone."
    ],
    "RiffMaster": [
      "Perfect for chunky metal riffs. The sustain is insane!",
      "Been using this for about 6 months now. Holds up well on tour.",
      "Solid build quality. Stays in tune even after heavy playing.",
      "A bit heavy for my taste, but the sound makes up for it.",
      "This thing is a beast for drop tunings. No need for a 7-string anymore!"
    ],
    "ToneSeeker": [
      "The clarity in the high end is phenomenal. Very articulate.",
      "I've tried dozens of similar models and this one has the sweetest mid-range.",
      "Pairs perfectly with my tube amp setup. So responsive to dynamics!",
      "Subtle differences from the previous version, but definitely an upgrade in terms of tone.",
      "The harmonic content and overtones are exactly what I've been searching for."
    ],
    "ShredQueen": [
      "Fast neck, low action, what more could you ask for? Shredding machine!",
      "The fretwork is immaculate. No buzzing anywhere on the neck.",
      "Handles alternate tunings like a dream. No intonation issues.",
      "Love how it cuts through the mix during solos. My band is jealous!",
      "From lightning-fast runs to complex chords, this thing handles it all."
    ],
    "BluesPicker": [
      "Soulful warm tone that really sings. Perfect for those expressive bends.",
      "Has that vintage mojo you just can't find in most modern gear.",
      "Smooth as whiskey. The neck pickup is to die for.",
      "Responds beautifully to picking dynamics. You can whisper or scream with this thing.",
      "Takes pedals incredibly well. My Tube Screamer sounds better than ever through this."
    ],
    "JazzCat": [
      "Beautiful clean tones with just the right amount of warmth.",
      "The neck profile is perfect for complex chord voicings.",
      "Incredibly versatile for a jazz-focused instrument. Handles fusion equally well.",
      "The build quality justifies the price. This will last a lifetime.",
      "Surprisingly good unplugged tone - great for practice without an amp."
    ],
    "AcousticDreamer": [
      "Rich sustain and balanced EQ across all strings. No dead spots.",
      "The craftsmanship is outstanding. Every detail feels premium.",
      "Records beautifully - both with a mic and direct in.",
      "Perfect for fingerstyle and flatpicking alike.",
      "Great projection without being overly boomy. Works well in a band context."
    ],
    "PedalJunkie": [
      "Incredibly transparent. Lets all my effects shine through.",
      "Amazing platform for building tones. Takes everything I throw at it.",
      "The built-in effects loop is super clean with no signal loss.",
      "I'm getting sounds I never thought possible with my pedalboard now.",
      "Finally something that doesn't color my carefully crafted tone stack."
    ],
    "VintageVibes": [
      "They don't make 'em like this anymore. A true tribute to the golden era.",
      "The aging work looks authentic, not like a reliced parody.",
      "Period-correct specs but with modern reliability. Perfect combination.",
      "Worth every penny for serious collectors and players alike.",
      "Compares favorably to my original from the 50s at a fraction of the cost."
    ],
    "MetalMaster666": [
      "Brutal! The low end is crushing for heavy downtuned riffs.",
      "Screams for days with incredible upper fret access.",
      "Finally a stock guitar that comes properly set up for metal out of the box.",
      "The active pickups give me all the gain I need without noise issues.",
      "Plays fast and sounds huge. What more could you want for extreme styles?"
    ]
  };
  
  // Define appropriate comment templates for different equipment types
  const equipmentTypeComments = {
    "guitar": {
      "generic": [
        "The playability is excellent, very comfortable neck profile.",
        "Great tone across all pickup positions.",
        "The finish is flawless and looks even better in person.",
        "Incredible value for the money, punches above its price point.",
        "The fretwork is impeccable with no sharp edges."
      ],
      "specific": {
        "Fender": [
          "Classic Fender chime and sparkle. Unmistakable tone.",
          "The comfort contours make this so nice to play for hours.",
          "That single-coil quack is exactly what I was looking for."
        ],
        "Gibson": [
          "Thick, creamy humbucker tone that cuts through any mix.",
          "Incredible sustain thanks to the mahogany body.",
          "The weight feels substantial but not too heavy."
        ],
        "Ibanez": [
          "The wizard neck is incredibly fast for lead playing.",
          "Stays in tune perfectly even with heavy tremolo use.",
          "Versatile enough for everything from jazz to metal."
        ],
        "PRS": [
          "The coil-splitting option adds incredible versatility.",
          "Craftsmanship is second to none, not a single flaw.",
          "Perfectly balanced tone between Gibson warmth and Fender clarity."
        ]
      }
    },
    "amp": {
      "generic": [
        "Great headroom for clean tones before breaking up.",
        "Takes pedals extremely well with the effects loop.",
        "Compact but still delivers huge sound.",
        "The build quality is tank-like, will last forever.",
        "Perfect for small to medium venues without being too loud."
      ],
      "specific": {
        "Fender": [
          "That classic Fender clean tone is unmistakable.",
          "The spring reverb is lush and deep.",
          "Perfect platform for pedals."
        ],
        "Marshall": [
          "The British crunch is exactly what I was after.",
          "Cuts through the mix perfectly in a band setting.",
          "The EQ section is incredibly responsive."
        ],
        "Mesa/Boogie": [
          "The gain saturation is incredible while remaining articulate.",
          "So many tonal options with just one amp.",
          "The rectifier options change the feel completely."
        ],
        "Vox": [
          "That chime and jangle is perfect for indie and classic rock.",
          "The break-up is musical at every stage.",
          "Surprisingly versatile for styles beyond the typical British sound."
        ]
      }
    },
    "pedal": {
      "generic": [
        "Built like a tank, will survive any pedalboard.",
        "Very low noise floor, perfect for recording.",
        "Intuitive controls that are easy to dial in.",
        "Works great at both 9V and 18V power.",
        "Flexible enough to work with both guitar and bass."
      ],
      "specific": {
        "Overdrive": [
          "Pushes my amp into sweet spot territory.",
          "Retains note definition even with complex chords.",
          "Doesn't color my tone when turned off."
        ],
        "Delay": [
          "The repeats have a wonderful warm character.",
          "Tap tempo works perfectly for live situations.",
          "Self-oscillation creates amazing ambient textures."
        ],
        "Reverb": [
          "Creates everything from subtle ambience to massive washy soundscapes.",
          "The decay is natural and never sounds digital or forced.",
          "Doesn't muddy up the mix even with long settings."
        ],
        "Fuzz": [
          "Sputtery, velcro-like tones at extreme settings.",
          "Cleans up nicely with guitar volume control.",
          "Thick sustain for days on solo notes."
        ]
      }
    }
  };
  
  equipmentIds.forEach(equipment => {
    // Add 1-3 comments for each equipment
    const commentCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < commentCount; i++) {
      // Select a random user to be the commenter
      const randomUserIndex = Math.floor(Math.random() * userIds.length);
      const user = users[randomUserIndex];
      const username = user.username;
      
      // Get appropriate comment templates for this user
      let commentText = "";
      const userTemplates = commentTemplates[username] || commentTemplates["ToneSeeker"];
      
      // 50% chance to use a user-specific comment
      if (Math.random() > 0.5) {
        const randomTemplateIndex = Math.floor(Math.random() * userTemplates.length);
        commentText = userTemplates[randomTemplateIndex];
      } else {
        // Otherwise use equipment-specific comment based on type and brand
        const equipmentType = equipment.type;
        const equipmentBrand = equipment.brand;
        
        // Get generic comments for this type of equipment
        const genericComments = equipmentTypeComments[equipmentType]?.generic || [];
        
        // Try to get brand-specific or effect-specific comments
        let specificComments = [];
        if (equipmentType === "guitar" || equipmentType === "amp") {
          specificComments = equipmentTypeComments[equipmentType]?.specific?.[equipmentBrand] || [];
        } else if (equipmentType === "pedal") {
          specificComments = equipmentTypeComments[equipmentType]?.specific?.[equipment.effectType] || [];
        }
        
        // Combine generic and specific comments
        const availableComments = [...genericComments, ...specificComments];
        
        // Select a random comment
        const randomIndex = Math.floor(Math.random() * availableComments.length);
        commentText = availableComments[randomIndex];
      }
      
      // Generate a random date within the past year
      const now = new Date();
      const pastDate = new Date(now.setDate(now.getDate() - Math.floor(Math.random() * 365)));
      
      comments.push({
        equipmentId: equipment._id,
        userId: userIds[randomUserIndex],
        text: commentText,
        date: new Date(pastDate.toISOString())
      });
    }
  });
  
  return comments;
}

// Add user ID to equipment
function assignUsersToEquipment(equipment, userIds) {
  return equipment.map((item, index) => {
    item.userId = userIds[index % userIds.length];
    return item;
  });
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

    // Assign users to equipment
    const guitarsWithUsers = assignUsersToEquipment(guitars, userIds);
    const ampsWithUsers = assignUsersToEquipment(amps, userIds);
    const pedalsWithUsers = assignUsersToEquipment(pedals, userIds);

    // Insert equipment
    const insertedGuitars = await Guitar.insertMany(guitarsWithUsers);
    console.log(`Inserted ${insertedGuitars.length} guitars`);

    const insertedAmps = await Amp.insertMany(ampsWithUsers);
    console.log(`Inserted ${insertedAmps.length} amps`);

    const insertedPedals = await Pedal.insertMany(pedalsWithUsers);
    console.log(`Inserted ${insertedPedals.length} pedals`);

    // Combine all equipment
    const allEquipment = [
      ...insertedGuitars,
      ...insertedAmps,
      ...insertedPedals
    ];

    // Generate and insert comments
    const comments = generateComments(allEquipment, userIds);
    const insertedComments = await Comments.insertMany(comments);
    console.log(`Inserted ${insertedComments.length} comments`);

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
    let updatedCount = 0;
    for (const equipmentId in commentsByEquipment) {
      await mongoose.model("Equipment").findByIdAndUpdate(
        equipmentId,
        { $set: { comments: commentsByEquipment[equipmentId] } }
      );
      updatedCount++;
    }
    console.log(`Updated ${updatedCount} equipment items with comments`);

    console.log("Database populated successfully");
    console.log(`Summary:
    - ${insertedUsers.length} users
    - ${insertedGuitars.length} guitars
    - ${insertedAmps.length} amps
    - ${insertedPedals.length} pedals
    - ${insertedComments.length} comments`);
  } catch (err) {
    console.error("Error populating database:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database");
  }
}

populateDatabase();