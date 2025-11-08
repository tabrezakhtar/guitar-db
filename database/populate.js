const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { Guitar, Amp, Pedal, Bass, Acoustic, Accessory, Comments } = require("../models/equipment");
const User = require("../models/user");
const Tag = require("../models/tag");
const Log = require("../models/log");
const Version = require("../models/version");

const uri = "mongodb://localhost:27017/guitar-db";

function loadJsonFile(filename) {
  const filePath = path.join(__dirname, "data", filename);
  const fileContent = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileContent);
}

const users = loadJsonFile("users.json");
const guitars = loadJsonFile("guitars.json");
const acoustic = loadJsonFile("acoustic.json");
const amps = loadJsonFile("amps.json").map(amp => {
  
  if (amp.power === "N/A") {
    amp.power = null;
  }
  return amp;
});
const pedals = loadJsonFile("pedals.json");
const bass = loadJsonFile("bass.json");
const accessories = loadJsonFile("accessories.json");
const tags = loadJsonFile("tags.json");


function generateComments(equipmentIds, userIds) {
  const comments = [];
  
  
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
    "acoustic": {
      "generic": [
        "Beautiful natural tone with excellent projection.",
        "The craftsmanship and attention to detail is outstanding.",
        "Perfect balance between bass and treble frequencies.",
        "Comfortable neck profile for both fingerpicking and strumming.",
        "Records beautifully with both microphones and direct input."
      ],
      "specific": {
        "Martin": [
          "That classic Martin boom and sustain is unmistakable.",
          "The vintage Martin tone with modern playability.",
          "Incredible dynamics from whisper quiet to thunderous projection."
        ],
        "Taylor": [
          "Crystal clear highs with balanced mids and tight bass.",
          "The electronics sound incredibly natural when amplified.",
          "Modern innovation meets traditional acoustic guitar building."
        ],
        "Gibson": [
          "Warm, woody tone that's perfect for singer-songwriters.",
          "The square shoulder design gives such powerful projection.",
          "Classic American acoustic guitar sound at its finest."
        ],
        "Yamaha": [
          "Incredible value with professional-level tone and playability.",
          "Consistent quality and reliability that you can depend on.",
          "Great for beginners but sounds good enough for recording."
        ],
        "Takamine": [
          "The electronics integration is seamless and natural sounding.",
          "Excellent stage guitar with reliable pickup system.",
          "Comfortable neck that's easy to play for hours."
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
    },
    "bass": {
      "generic": [
        "Solid low-end foundation that sits perfectly in the mix.",
        "Great string-to-string balance across all four strings.",
        "The neck is fast and comfortable for both fingerstyle and pick playing.",
        "Excellent build quality with attention to detail.",
        "Versatile enough for multiple musical styles."
      ],
      "specific": {
        "Fender": [
          "That classic Fender bass thump is unmistakable.",
          "The P-Bass growl cuts through without being muddy.",
          "Perfect for everything from rock to jazz."
        ],
        "Music Man": [
          "The active EQ gives incredible tonal flexibility.",
          "Punchy and aggressive tone that sits perfectly in rock mixes.",
          "The build quality is absolutely top-notch."
        ],
        "Gibson": [
          "Rich, woody tone with incredible sustain.",
          "The through-neck design provides amazing resonance.",
          "Perfect for classic rock and blues applications."
        ],
        "Ibanez": [
          "Modern design with excellent ergonomics.",
          "The electronics are quiet and versatile.",
          "Great value for a professional-level instrument."
        ],
        "Hofner": [
          "That distinctive hollow-body thump is magical.",
          "Lightweight and comfortable for long playing sessions.",
          "Perfect for Beatles-style melodic bass lines."
        ],
        "Rickenbacker": [
          "The jangly, articulate tone is perfect for prog rock.",
          "Rick-O-Sound opens up incredible stereo possibilities.",
          "Beautiful craftsmanship and attention to detail."
        ]
      }
    },
    "accessory": {
      "generic": [
        "Essential addition to any guitarist's setup.",
        "Great build quality that will last for years.",
        "Excellent value for money.",
        "Works exactly as advertised.",
        "Would definitely recommend to other players."
      ],
      "specific": {
        "Strings": [
          "Perfect tension and great tone right out of the package.",
          "Long-lasting with excellent tuning stability.",
          "Bright tone that records beautifully."
        ],
        "Picks": [
          "Great grip and control for precise playing.",
          "Perfect thickness for my playing style.",
          "Durable material that doesn't wear down quickly."
        ],
        "Tuner": [
          "Fast and accurate tuning every time.",
          "Easy to read display even in low light.",
          "Rock-solid construction for stage use."
        ],
        "Strap": [
          "Comfortable for long playing sessions.",
          "Secure connection that gives confidence on stage.",
          "Looks great with any guitar."
        ],
        "Case/Bag": [
          "Excellent protection for transport.",
          "Well-designed storage compartments.",
          "Quality construction that will protect my investment."
        ],
        "Cable": [
          "Crystal clear signal with no noise.",
          "Robust construction for stage reliability.",
          "Great length for studio and live use."
        ],
        "Stand": [
          "Stable and secure for any guitar.",
          "Easy setup and breakdown.",
          "Takes up minimal space when not in use."
        ],
        "Microphone": [
          "Captures amp tone beautifully.",
          "Industry standard for a reason.",
          "Built like a tank and sounds amazing."
        ],
        "Effects Pedal": [
          "Adds exactly the sound I was looking for.",
          "High-quality construction with true bypass.",
          "Integrates perfectly with my existing pedalboard."
        ]
      }
    }
  };
  
  equipmentIds.forEach(equipment => {
    
    const commentCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < commentCount; i++) {
      
      const randomUserIndex = Math.floor(Math.random() * userIds.length);
      const userId = userIds[randomUserIndex];
      const user = users[randomUserIndex];
      const username = user.username;
      
      
      let commentText = "";
      const userTemplates = commentTemplates[username] || commentTemplates["ToneSeeker"];
      
      
      if (Math.random() > 0.5) {
        const randomTemplateIndex = Math.floor(Math.random() * userTemplates.length);
        commentText = userTemplates[randomTemplateIndex];
      } else {
        
        const equipmentType = equipment.type;
        const equipmentBrand = equipment.brand;
        
        
        const genericComments = equipmentTypeComments[equipmentType]?.generic || [];
        
        
        let specificComments = [];
        if (equipmentType === "guitar" || equipmentType === "amp" || equipmentType === "bass") {
          specificComments = equipmentTypeComments[equipmentType]?.specific?.[equipmentBrand] || [];
        } else if (equipmentType === "pedal") {
          specificComments = equipmentTypeComments[equipmentType]?.specific?.[equipment.effectType] || [];
        } else if (equipmentType === "accessory") {
          specificComments = equipmentTypeComments[equipmentType]?.specific?.[equipment.accessoryType] || [];
        }
        
        
        const availableComments = [...genericComments, ...specificComments];
        
        
        const randomIndex = Math.floor(Math.random() * availableComments.length);
        commentText = availableComments[randomIndex];
      }
      
      
      const now = new Date();
      const pastDate = new Date(now.setDate(now.getDate() - Math.floor(Math.random() * 365)));
      
      comments.push({
        equipmentId: equipment._id,
        user: userId,  
        text: commentText,
        date: new Date(pastDate.toISOString())
      });
    }
  });
  
  return comments;
}

function getPicsumImages(count = 5) {
  const resolutions = [
    [1000, 600],
    [800, 400],
    [600, 300],
    [1300, 800],
    [1200, 800],
    [768, 1224],
    [400, 800],
    [380, 640],
    [900, 1400],
    [900, 1600]
  ];
  const images = [];
  for (let i = 0; i < count; i++) {
    const [w, h] = resolutions[i % resolutions.length];
    
    const seed = Math.floor(Math.random() * 1000000) + Date.now() + i;
    images.push(`https:
  }
  
  for (let i = images.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [images[i], images[j]] = [images[j], images[i]];
  }
  return images;
}


function assignUsersToEquipment(equipment, userIds) {
  return equipment.map((item, index) => {
    item.user = userIds[index % userIds.length];
    item.images = getPicsumImages(10);
    return item;
  });
}


function assignTagsToEquipment(equipment, tagIds) {
  return equipment.map(item => {
    
    const tagCount = Math.floor(Math.random() * 4) + 1;
    
    
    const availableTags = [...tagIds];
    
    
    for (let i = availableTags.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableTags[i], availableTags[j]] = [availableTags[j], availableTags[i]];
    }
    
    
    item.tags = availableTags.slice(0, tagCount);
    
    return item;
  });
}

async function populateDatabase() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to database");    
    const collectionNames = ["equipment", "users", "comments", "tags", "logs", "versions"];
    for (const name of collectionNames) {
      const collections = await mongoose.connection.db.listCollections({ name }).toArray();
      if (collections.length > 0) {
        await mongoose.connection.db.dropCollection(name);
        console.log(`Collection '${name}' dropped`);
      }
    }

    
    const insertedUsers = await User.insertMany(users);
    console.log("Inserted users");
    const userIds = insertedUsers.map(user => user._id);

    
    const insertedTags = await Tag.insertMany(tags);
    console.log(`Inserted ${insertedTags.length} tags`);
    const tagIds = insertedTags.map(tag => tag._id);

    
    const guitarsWithUsers = assignUsersToEquipment(guitars, userIds);
    const acousticWithUsers = assignUsersToEquipment(acoustic, userIds);
    const ampsWithUsers = assignUsersToEquipment(amps, userIds);
    const pedalsWithUsers = assignUsersToEquipment(pedals, userIds);
    const bassWithUsers = assignUsersToEquipment(bass, userIds);
    const accessoriesWithUsers = assignUsersToEquipment(accessories, userIds);

    
    const guitarsWithTags = assignTagsToEquipment(guitarsWithUsers, tagIds);
    const acousticWithTags = assignTagsToEquipment(acousticWithUsers, tagIds);
    const ampsWithTags = assignTagsToEquipment(ampsWithUsers, tagIds);
    const pedalsWithTags = assignTagsToEquipment(pedalsWithUsers, tagIds);
    const bassWithTags = assignTagsToEquipment(bassWithUsers, tagIds);
    const accessoriesWithTags = assignTagsToEquipment(accessoriesWithUsers, tagIds);

    
    const insertedGuitars = await Guitar.insertMany(guitarsWithTags);
    console.log(`Inserted ${insertedGuitars.length} guitars`);

    const insertedAcoustic = await Acoustic.insertMany(acousticWithTags);
    console.log(`Inserted ${insertedAcoustic.length} acoustic guitars`);

    const insertedAmps = await Amp.insertMany(ampsWithTags);
    console.log(`Inserted ${insertedAmps.length} amps`);

    const insertedPedals = await Pedal.insertMany(pedalsWithTags);
    console.log(`Inserted ${insertedPedals.length} pedals`);

    const insertedBass = await Bass.insertMany(bassWithTags);
    console.log(`Inserted ${insertedBass.length} bass guitars`);

    const insertedAccessories = await Accessory.insertMany(accessoriesWithTags);
    console.log(`Inserted ${insertedAccessories.length} accessories`);

    
    const allEquipment = [
      ...insertedGuitars,
      ...insertedAcoustic,
      ...insertedAmps,
      ...insertedPedals,
      ...insertedBass,
      ...insertedAccessories
    ];

    
    const comments = generateComments(allEquipment, userIds);
    const insertedComments = await Comments.insertMany(comments);
    console.log(`Inserted ${insertedComments.length} comments`);

    
    const commentsByEquipment = {};
    insertedComments.forEach(comment => {
      const equipmentId = comment.equipmentId.toString();
      if (!commentsByEquipment[equipmentId]) {
        commentsByEquipment[equipmentId] = [];
      }
      commentsByEquipment[equipmentId].push(comment._id);
    });

    
    let updatedCount = 0;
    for (const equipmentId in commentsByEquipment) {
      await mongoose.model("Equipment").findByIdAndUpdate(
        equipmentId,
        { $set: { comments: commentsByEquipment[equipmentId] } }
      );
      updatedCount++;
    }
    console.log(`Updated ${updatedCount} equipment items with comments`);

    
    const exampleLogs = [];
    
    
    for (let i = 0; i < 10; i++) {
      const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
      const randomEquipment = allEquipment[Math.floor(Math.random() * allEquipment.length)];
      
      exampleLogs.push({
        level: "info",
        message: "User added new equipment to collection",
        userId: randomUser,
        action: "add_equipment",
        relatedId: randomEquipment._id.toString(),
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)) 
      });
    }

    
    for (let i = 0; i < 5; i++) {
      const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
      
      exampleLogs.push({
        level: "info",
        message: "User logged in successfully",
        userId: randomUser,
        action: "login",
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)) 
      });
    }

    
    exampleLogs.push({
      level: "error",
      message: "Database connection timeout",
      action: "database_query",
      error: {
        message: "Connection timeout after 30000ms",
        stack: "Error: Connection timeout\n    at Database.connect (/app/db.js:45:12)"
      },
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)) 
    });

    exampleLogs.push({
      level: "error",
      message: "Failed to upload image",
      userId: userIds[0],
      action: "upload_image",
      relatedId: allEquipment[0]._id.toString(),
      error: {
        message: "File size exceeds limit",
        stack: "Error: File too large\n    at ImageUpload.validate (/app/upload.js:23:8)"
      },
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 48 * 60 * 60 * 1000)) 
    });

    
    for (let i = 0; i < 3; i++) {
      const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
      const randomEquipment = allEquipment[Math.floor(Math.random() * allEquipment.length)];
      
      exampleLogs.push({
        level: "info",
        message: "User posted comment on equipment",
        userId: randomUser,
        action: "add_comment",
        relatedId: randomEquipment._id.toString(),
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 14 * 24 * 60 * 60 * 1000)) 
      });
    }    
    const insertedLogs = await Log.insertMany(exampleLogs);
    console.log(`Inserted ${insertedLogs.length} example logs`);

    
    const versionData = {
      version: "0.1",
      description: "Initial version of riffbook database"
    };
    
    const insertedVersion = await Version.create(versionData);
    console.log(`Created version: ${insertedVersion.version}`);

    console.log("Database populated successfully");    console.log(`Summary:
    - ${insertedUsers.length} users
    - ${insertedGuitars.length} guitars
    - ${insertedAcoustic.length} acoustic guitars
    - ${insertedAmps.length} amps
    - ${insertedPedals.length} pedals
    - ${insertedBass.length} bass guitars
    - ${insertedAccessories.length} accessories
    - ${insertedComments.length} comments
    - ${insertedTags.length} tags
    - ${insertedLogs.length} logs
    - Version: ${insertedVersion.version}`);
  } catch (err) {
    console.error("Error populating database:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database");
  }
}

if (!uri.includes("localhost")) {
  console.log("Not on localhost, skipping database population.");
  process.exit(0);
}
  

populateDatabase();
