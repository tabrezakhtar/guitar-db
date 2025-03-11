const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const dbName = "guitar-db";
const collectionName = "guitars";

const guitars = [
  {
    "_id": "67ccee27316eceb6d520ce3b",
    "brand": "fender",
    "shape": "stratocaster",
    "name": "american professional ii",
    "series": "professional",
    "pickups": "single-coil",
    "trem": "2-point synchronized tremolo",
    "frets": 22,
    "tuners": "standard cast/sealed",
    "colour": "yellow",
    "fretboard": "maple",
    "description": "A versatile guitar with a classic design."
  },
  {
    "_id": "67ccee27316eceb6d520ce3c",
    "brand": "fender",
    "shape": "telecaster",
    "name": "american ultra",
    "series": "ultra",
    "pickups": "single-coil",
    "trem": "none",
    "frets": 22,
    "tuners": "deluxe cast/sealed",
    "colour": "yellow",
    "fretboard": "rosewood",
    "description": "A modern take on the classic Telecaster."
  },
  {
    "_id": "67ccee27316eceb6d520ce3d",
    "brand": "fender",
    "shape": "jaguar",
    "name": "player",
    "series": "player",
    "pickups": "humbucker",
    "trem": "floating tremolo",
    "frets": 22,
    "tuners": "standard cast/sealed",
    "colour": "black",
    "fretboard": "pau ferro",
    "description": "A versatile guitar with a unique design."
  },
  {
    "_id": "67ccee27316eceb6d520ce3e",
    "brand": "fender",
    "shape": "mustang",
    "name": "american performer",
    "series": "performer",
    "pickups": "single-coil",
    "trem": "dynamic vibrato",
    "frets": 22,
    "tuners": "classic gear",
    "colour": "purple",
    "fretboard": "maple",
    "description": "A short-scale guitar with a distinctive sound."
  },
  {
    "_id": "67ccee27316eceb6d520ce3f",
    "brand": "fender",
    "shape": "jazzmaster",
    "name": "american original",
    "series": "original",
    "pickups": "single-coil",
    "trem": "floating tremolo",
    "frets": 21,
    "tuners": "vintage-style",
    "colour": "white",
    "fretboard": "rosewood",
    "description": "A classic guitar with a rich history."
  },
  {
    "_id": "67ccee27316eceb6d520ce40",
    "brand": "fender",
    "shape": "stratocaster",
    "name": "player",
    "series": "player",
    "pickups": "single-coil",
    "trem": "2-point synchronized tremolo",
    "frets": 22,
    "tuners": "standard cast/sealed",
    "colour": "white",
    "fretboard": "maple",
    "description": "A versatile guitar with a classic design."
  },
  {
    "_id": "67ccee27316eceb6d520ce41",
    "brand": "fender",
    "shape": "telecaster",
    "name": "american professional ii",
    "series": "professional",
    "pickups": "single-coil",
    "trem": "none",
    "frets": 22,
    "tuners": "standard cast/sealed",
    "colour": "blue",
    "fretboard": "maple",
    "description": "A modern take on the classic Telecaster."
  },
  {
    "_id": "67ccee27316eceb6d520ce42",
    "brand": "fender",
    "shape": "jaguar",
    "name": "american performer",
    "series": "performer",
    "pickups": "humbucker",
    "trem": "floating tremolo",
    "frets": 22,
    "tuners": "classic gear",
    "colour": "blue",
    "fretboard": "rosewood",
    "description": "A versatile guitar with a unique design."
  },
  {
    "_id": "67ccee27316eceb6d520ce43",
    "brand": "fender",
    "shape": "mustang",
    "name": "player",
    "series": "player",
    "pickups": "single-coil",
    "trem": "dynamic vibrato",
    "frets": 22,
    "tuners": "standard cast/sealed",
    "colour": "yellow",
    "fretboard": "pau ferro",
    "description": "A short-scale guitar with a distinctive sound."
  },
  {
    "_id": "67ccee27316eceb6d520ce44",
    "brand": "fender",
    "shape": "jazzmaster",
    "name": "american ultra",
    "series": "ultra",
    "pickups": "single-coil",
    "trem": "floating tremolo",
    "frets": 21,
    "tuners": "deluxe cast/sealed",
    "colour": "black",
    "fretboard": "rosewood",
    "description": "A classic guitar with a rich history."
  },
  {
    "_id": "67ccee27316eceb6d520ce45",
    "brand": "gibson",
    "shape": "les paul",
    "name": "standard 50s",
    "series": "standard",
    "pickups": "humbucker",
    "trem": "none",
    "frets": 22,
    "tuners": "vintage deluxe",
    "colour": "red",
    "fretboard": "rosewood",
    "description": "A classic guitar with a powerful sound."
  },
  {
    "_id": "67ccee27316eceb6d520ce46",
    "brand": "gibson",
    "shape": "sg",
    "name": "standard",
    "series": "standard",
    "pickups": "humbucker",
    "trem": "none",
    "frets": 22,
    "tuners": "vintage deluxe",
    "colour": "red",
    "fretboard": "rosewood",
    "description": "A lightweight guitar with a fast neck."
  },
  {
    "_id": "67ccee27316eceb6d520ce47",
    "brand": "gibson",
    "shape": "explorer",
    "name": "original",
    "series": "original",
    "pickups": "humbucker",
    "trem": "none",
    "frets": 22,
    "tuners": "grover mini rotomatics",
    "colour": "yellow",
    "fretboard": "rosewood",
    "description": "A futuristic guitar with a bold design."
  },
  {
    "_id": "67ccee27316eceb6d520ce48",
    "brand": "gibson",
    "shape": "flying v",
    "name": "original",
    "series": "original",
    "pickups": "humbucker",
    "trem": "none",
    "frets": 22,
    "tuners": "grover mini rotomatics",
    "colour": "white",
    "fretboard": "rosewood",
    "description": "A radical guitar with a distinctive look."
  },
  {
    "_id": "67ccee27316eceb6d520ce49",
    "brand": "gibson",
    "shape": "firebird",
    "name": "original",
    "series": "original",
    "pickups": "mini-humbucker",
    "trem": "none",
    "frets": 22,
    "tuners": "grover mini rotomatics",
    "colour": "yellow",
    "fretboard": "rosewood",
    "description": "A unique guitar with a reverse body design."
  },
  {
    "_id": "67ccee27316eceb6d520ce4a",
    "brand": "gibson",
    "shape": "les paul",
    "name": "standard 60s",
    "series": "standard",
    "pickups": "humbucker",
    "trem": "none",
    "frets": 22,
    "tuners": "vintage deluxe",
    "colour": "yellow",
    "fretboard": "rosewood",
    "description": "A classic guitar with a powerful sound."
  },
  {
    "_id": "67ccee27316eceb6d520ce4b",
    "brand": "gibson",
    "shape": "sg",
    "name": "special",
    "series": "special",
    "pickups": "p-90",
    "trem": "none",
    "frets": 22,
    "tuners": "vintage deluxe",
    "colour": "blue",
    "fretboard": "rosewood",
    "description": "A lightweight guitar with a fast neck."
  },
  {
    "_id": "67ccee27316eceb6d520ce4c",
    "brand": "gibson",
    "shape": "explorer",
    "name": "custom",
    "series": "custom",
    "pickups": "humbucker",
    "trem": "none",
    "frets": 22,
    "tuners": "grover mini rotomatics",
    "colour": "black",
    "fretboard": "ebony",
    "description": "A futuristic guitar with a bold design."
  },
  {
    "_id": "67ccee27316eceb6d520ce4d",
    "brand": "gibson",
    "shape": "flying v",
    "name": "custom",
    "series": "custom",
    "pickups": "humbucker",
    "trem": "none",
    "frets": 22,
    "tuners": "grover mini rotomatics",
    "colour": "black",
    "fretboard": "ebony",
    "description": "A radical guitar with a distinctive look."
  },
  {
    "_id": "67ccee27316eceb6d520ce4e",
    "brand": "gibson",
    "shape": "firebird",
    "name": "custom",
    "series": "custom",
    "pickups": "mini-humbucker",
    "trem": "none",
    "frets": 22,
    "tuners": "grover mini rotomatics",
    "colour": "black",
    "fretboard": "ebony",
    "description": "A unique guitar with a reverse body design."
  },
  {
    "_id": "67ccee27316eceb6d520ce4f",
    "brand": "ibanez",
    "shape": "rg",
    "name": "rg550",
    "series": "genesis collection",
    "pickups": "humbucker",
    "trem": "edge",
    "frets": 24,
    "tuners": "gotoh",
    "colour": "red",
    "fretboard": "maple",
    "description": "A high-performance guitar with a fast neck."
  },
  {
    "_id": "67ccee27316eceb6d520ce50",
    "brand": "ibanez",
    "shape": "s",
    "name": "s670qm",
    "series": "standard",
    "pickups": "humbucker",
    "trem": "edge zero ii",
    "frets": 24,
    "tuners": "gotoh",
    "colour": "yellow",
    "fretboard": "rosewood",
    "description": "A sleek guitar with a versatile sound."
  },
  {
    "_id": "67ccee27316eceb6d520ce51",
    "brand": "ibanez",
    "shape": "jem",
    "name": "jemjr",
    "series": "standard",
    "pickups": "humbucker",
    "trem": "double locking tremolo",
    "frets": 24,
    "tuners": "gotoh",
    "colour": "white",
    "fretboard": "rosewood",
    "description": "A signature guitar with a unique design."
  },
  {
    "_id": "67ccee27316eceb6d520ce52",
    "brand": "ibanez",
    "shape": "rg",
    "name": "rg421",
    "series": "standard",
    "pickups": "humbucker",
    "trem": "none",
    "frets": 24,
    "tuners": "gotoh",
    "colour": "brown",
    "fretboard": "rosewood",
    "description": "A high-performance guitar with a fast neck."
  },
  {
    "_id": "67ccee27316eceb6d520ce53",
    "brand": "ibanez",
    "shape": "s",
    "name": "s520",
    "series": "standard",
    "pickups": "humbucker",
    "trem": "edge zero ii",
    "frets": 24,
    "tuners": "gotoh",
    "colour": "yellow",
    "fretboard": "rosewood",
    "description": "A sleek guitar with a versatile sound."
  },
  {
    "_id": "67ccee27316eceb6d520ce54",
    "brand": "ibanez",
    "shape": "jem",
    "name": "jem7v",
    "series": "signature",
    "pickups": "humbucker",
    "trem": "edge",
    "frets": 24,
    "tuners": "gotoh",
    "colour": "white",
    "fretboard": "ebony",
    "description": "A signature guitar with a unique design."
  },
  {
    "_id": "67ccee27316eceb6d520ce55",
    "brand": "ibanez",
    "shape": "rg",
    "name": "rg550dx",
    "series": "genesis collection",
    "pickups": "humbucker",
    "trem": "edge",
    "frets": 24,
    "tuners": "gotoh",
    "colour": "purple",
    "fretboard": "maple",
    "description": "A high-performance guitar with a fast neck."
  },
  {
    "_id": "67ccee27316eceb6d520ce56",
    "brand": "ibanez",
    "shape": "s",
    "name": "s670ah",
    "series": "standard",
    "pickups": "humbucker",
    "trem": "edge zero ii",
    "frets": 24,
    "tuners": "gotoh",
    "colour": "yellow",
    "fretboard": "rosewood",
    "description": "A sleek guitar with a versatile sound."
  },
  {
    "_id": "67ccee27316eceb6d520ce57",
    "brand": "ibanez",
    "shape": "jem",
    "name": "jem77p",
    "series": "premium",
    "pickups": "humbucker",
    "trem": "edge",
    "frets": 24,
    "tuners": "gotoh",
    "colour": "blue",
    "fretboard": "maple",
    "description": "A signature guitar with a unique design."
  },
  {
    "_id": "67ccee27316eceb6d520ce58",
    "brand": "ibanez",
    "shape": "rg",
    "name": "rg550",
    "series": "genesis collection",
    "pickups": "humbucker",
    "trem": "edge",
    "frets": 24,
    "tuners": "gotoh",
    "colour": "yellow",
    "fretboard": "maple",
    "description": "A high-performance guitar with a fast neck."
  }
];

async function main() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log("Connected to database");

    const db = client.db(dbName);

    // Check if the collection exists and delete it if it does
    const collections = await db.listCollections({ name: collectionName }).toArray();
    if (collections.length > 0) {
      await db.collection(collectionName).drop();
      console.log(`Collection "${collectionName}" dropped`);
    }

    // Create the collection and insert the data
    const collection = db.collection(collectionName);
    await collection.insertMany(guitars);
    console.log("Data inserted into collection");
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
    console.log("Connection closed");
  }
}

main().catch(console.error);