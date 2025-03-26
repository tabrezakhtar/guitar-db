const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const dbName = "guitar-db";
const collectionName = "guitars";

const guitars = [
  {
    "brand": "Fender",
    "shape": "Stratocaster",
    "name": "American Professional Ii",
    "series": "Professional",
    "pickups": "Single-Coil",
    "tremolo": "2-Point Synchronized Tremolo",
    "frets": 22,
    "tuners": "Standard Cast/Sealed",
    "colour": "Yellow",
    "fretboard": "Maple",
    "description": "A versatile guitar with a classic design.",
    "price": 1500
  },
  {
    "brand": "Fender",
    "shape": "Telecaster",
    "name": "American Ultra",
    "series": "Ultra",
    "pickups": "Single-Coil",
    "tremolo": "None",
    "frets": 22,
    "tuners": "Deluxe Cast/Sealed",
    "colour": "Yellow",
    "fretboard": "Rosewood",
    "description": "A modern take on the classic Telecaster.",
    "price": 1800
  },
  {
    "brand": "Fender",
    "shape": "Jaguar",
    "name": "Player",
    "series": "Player",
    "pickups": "Humbucker",
    "tremolo": "Floating Tremolo",
    "frets": 22,
    "tuners": "Standard Cast/Sealed",
    "colour": "Black",
    "fretboard": "Pau Ferro",
    "description": "A versatile guitar with a unique design.",
    "price": 1200
  },
  {
    "brand": "Fender",
    "shape": "Mustang",
    "name": "American Performer",
    "series": "Performer",
    "pickups": "Single-Coil",
    "tremolo": "Dynamic Vibrato",
    "frets": 22,
    "tuners": "Classic Gear",
    "colour": "Purple",
    "fretboard": "Maple",
    "description": "A short-scale guitar with a distinctive sound.",
    "price": 1400
  },
  {
    "brand": "Fender",
    "shape": "Jazzmaster",
    "name": "American Original",
    "series": "Original",
    "pickups": "Single-Coil",
    "tremolo": "Floating Tremolo",
    "frets": 21,
    "tuners": "Vintage-Style",
    "colour": "White",
    "fretboard": "Rosewood",
    "description": "A classic guitar with a rich history.",
    "price": 2000
  },
  {
    "brand": "Fender",
    "shape": "Stratocaster",
    "name": "Player",
    "series": "Player",
    "pickups": "Single-Coil",
    "tremolo": "2-Point Synchronized Tremolo",
    "frets": 22,
    "tuners": "Standard Cast/Sealed",
    "colour": "White",
    "fretboard": "Maple",
    "description": "A versatile guitar with a classic design.",
    "price": 1100
  },
  {
    "brand": "Fender",
    "shape": "Telecaster",
    "name": "American Professional Ii",
    "series": "Professional",
    "pickups": "Single-Coil",
    "tremolo": "None",
    "frets": 22,
    "tuners": "Standard Cast/Sealed",
    "colour": "Blue",
    "fretboard": "Maple",
    "description": "A modern take on the classic Telecaster.",
    "price": 1500
  },
  {
    "brand": "Fender",
    "shape": "Jaguar",
    "name": "American Performer",
    "series": "Performer",
    "pickups": "Humbucker",
    "tremolo": "Floating Tremolo",
    "frets": 22,
    "tuners": "Classic Gear",
    "colour": "Blue",
    "fretboard": "Rosewood",
    "description": "A versatile guitar with a unique design.",
    "price": 1300
  },
  {
    "brand": "Fender",
    "shape": "Mustang",
    "name": "Player",
    "series": "Player",
    "pickups": "Single-Coil",
    "tremolo": "Dynamic Vibrato",
    "frets": 22,
    "tuners": "Standard Cast/Sealed",
    "colour": "Yellow",
    "fretboard": "Pau Ferro",
    "description": "A short-scale guitar with a distinctive sound.",
    "price": 1000
  },
  {
    "brand": "Fender",
    "shape": "Jazzmaster",
    "name": "American Ultra",
    "series": "Ultra",
    "pickups": "Single-Coil",
    "tremolo": "Floating Tremolo",
    "frets": 21,
    "tuners": "Deluxe Cast/Sealed",
    "colour": "Black",
    "fretboard": "Rosewood",
    "description": "A classic guitar with a rich history.",
    "price": 1900
  },
  {
    "brand": "Gibson",
    "shape": "Les Paul",
    "name": "Standard 50S",
    "series": "Standard",
    "pickups": "Humbucker",
    "tremolo": "None",
    "frets": 22,
    "tuners": "Vintage Deluxe",
    "colour": "Red",
    "fretboard": "Rosewood",
    "description": "A classic guitar with a powerful sound.",
    "price": 2500
  },
  {
    "brand": "Gibson",
    "shape": "Sg",
    "name": "Standard",
    "series": "Standard",
    "pickups": "Humbucker",
    "tremolo": "None",
    "frets": 22,
    "tuners": "Vintage Deluxe",
    "colour": "Red",
    "fretboard": "Rosewood",
    "description": "A lightweight guitar with a fast neck.",
    "price": 2000
  },
  {
    "brand": "Gibson",
    "shape": "Explorer",
    "name": "Original",
    "series": "Original",
    "pickups": "Humbucker",
    "tremolo": "None",
    "frets": 22,
    "tuners": "Grover Mini Rotomatics",
    "colour": "Yellow",
    "fretboard": "Rosewood",
    "description": "A futuristic guitar with a bold design.",
    "price": 2200
  },
  {
    "brand": "Gibson",
    "shape": "Flying V",
    "name": "Original",
    "series": "Original",
    "pickups": "Humbucker",
    "tremolo": "None",
    "frets": 22,
    "tuners": "Grover Mini Rotomatics",
    "colour": "White",
    "fretboard": "Rosewood",
    "description": "A radical guitar with a distinctive look.",
    "price": 2300
  },
  {
    "brand": "Gibson",
    "shape": "Firebird",
    "name": "Original",
    "series": "Original",
    "pickups": "Mini-Humbucker",
    "tremolo": "None",
    "frets": 22,
    "tuners": "Grover Mini Rotomatics",
    "colour": "Yellow",
    "fretboard": "Rosewood",
    "description": "A unique guitar with a reverse body design.",
    "price": 2400
  },
  {
    "brand": "Gibson",
    "shape": "Les Paul",
    "name": "Standard 60S",
    "series": "Standard",
    "pickups": "Humbucker",
    "tremolo": "None",
    "frets": 22,
    "tuners": "Vintage Deluxe",
    "colour": "Yellow",
    "fretboard": "Rosewood",
    "description": "A classic guitar with a powerful sound.",
    "price": 2600
  },
  {
    "brand": "Gibson",
    "shape": "Sg",
    "name": "Special",
    "series": "Special",
    "pickups": "P-90",
    "tremolo": "None",
    "frets": 22,
    "tuners": "Vintage Deluxe",
    "colour": "Blue",
    "fretboard": "Rosewood",
    "description": "A lightweight guitar with a fast neck.",
    "price": 2100
  },
  {
    "brand": "Gibson",
    "shape": "Explorer",
    "name": "Custom",
    "series": "Custom",
    "pickups": "Humbucker",
    "tremolo": "None",
    "frets": 22,
    "tuners": "Grover Mini Rotomatics",
    "colour": "Black",
    "fretboard": "Ebony",
    "description": "A futuristic guitar with a bold design.",
    "price": 2700
  },
  {
    "brand": "Gibson",
    "shape": "Flying V",
    "name": "Custom",
    "series": "Custom",
    "pickups": "Humbucker",
    "tremolo": "None",
    "frets": 22,
    "tuners": "Grover Mini Rotomatics",
    "colour": "Black",
    "fretboard": "Ebony",
    "description": "A radical guitar with a distinctive look.",
    "price": 2800
  },
  {
    "brand": "Gibson",
    "shape": "Firebird",
    "name": "Custom",
    "series": "Custom",
    "pickups": "Mini-Humbucker",
    "tremolo": "None",
    "frets": 22,
    "tuners": "Grover Mini Rotomatics",
    "colour": "Black",
    "fretboard": "Ebony",
    "description": "A unique guitar with a reverse body design.",
    "price": 2900
  },
  {
    "brand": "Ibanez",
    "shape": "Rg",
    "name": "Rg550",
    "series": "Genesis Collection",
    "pickups": "Humbucker",
    "tremolo": "Edge",
    "frets": 24,
    "tuners": "Gotoh",
    "colour": "Red",
    "fretboard": "Maple",
    "description": "A high-performance guitar with a fast neck.",
    "price": 1700
  },
  {
    "brand": "Ibanez",
    "shape": "S",
    "name": "S670Qm",
    "series": "Standard",
    "pickups": "Humbucker",
    "tremolo": "Edge Zero Ii",
    "frets": 24,
    "tuners": "Gotoh",
    "colour": "Yellow",
    "fretboard": "Rosewood",
    "description": "A sleek guitar with a versatile sound.",
    "price": 1500
  },
  {
    "brand": "Ibanez",
    "shape": "Jem",
    "name": "Jemjr",
    "series": "Standard",
    "pickups": "Humbucker",
    "tremolo": "Double Locking Tremolo",
    "frets": 24,
    "tuners": "Gotoh",
    "colour": "White",
    "fretboard": "Rosewood",
    "description": "A signature guitar with a unique design.",
    "price": 1800
  },
  {
    "brand": "Ibanez",
    "shape": "Rg",
    "name": "Rg421",
    "series": "Standard",
    "pickups": "Humbucker",
    "tremolo": "None",
    "frets": 24,
    "tuners": "Gotoh",
    "colour": "Brown",
    "fretboard": "Rosewood",
    "description": "A high-performance guitar with a fast neck.",
    "price": 1400
  },
  {
    "brand": "Ibanez",
    "shape": "S",
    "name": "S520",
    "series": "Standard",
    "pickups": "Humbucker",
    "tremolo": "Edge Zero Ii",
    "frets": 24,
    "tuners": "Gotoh",
    "colour": "Yellow",
    "fretboard": "Rosewood",
    "description": "A sleek guitar with a versatile sound.",
    "price": 1600
  },
  {
    "brand": "Ibanez",
    "shape": "Jem",
    "name": "Jem7V",
    "series": "Signature",
    "pickups": "Humbucker",
    "tremolo": "Edge",
    "frets": 24,
    "tuners": "Gotoh",
    "colour": "White",
    "fretboard": "Ebony",
    "description": "A signature guitar with a unique design.",
    "price": 3000
  },
  {
    "brand": "Ibanez",
    "shape": "Rg",
    "name": "Rg550Dx",
    "series": "Genesis Collection",
    "pickups": "Humbucker",
    "tremolo": "Edge",
    "frets": 24,
    "tuners": "Gotoh",
    "colour": "Purple",
    "fretboard": "Maple",
    "description": "A high-performance guitar with a fast neck.",
    "price": 1900
  },
  {
    "brand": "Ibanez",
    "shape": "S",
    "name": "S670Ah",
    "series": "Standard",
    "pickups": "Humbucker",
    "tremolo": "Edge Zero Ii",
    "frets": 24,
    "tuners": "Gotoh",
    "colour": "Yellow",
    "fretboard": "Rosewood",
    "description": "A sleek guitar with a versatile sound.",
    "price": 1500
  },
  {
    "brand": "Ibanez",
    "shape": "Jem",
    "name": "Jem77P",
    "series": "Premium",
    "pickups": "Humbucker",
    "tremolo": "Edge",
    "frets": 24,
    "tuners": "Gotoh",
    "colour": "Blue",
    "fretboard": "Maple",
    "description": "A signature guitar with a unique design.",
    "price": 3200
  },
  {
    "brand": "Ibanez",
    "shape": "Rg",
    "name": "Rg550",
    "series": "Genesis Collection",
    "pickups": "Humbucker",
    "tremolo": "Edge",
    "frets": 24,
    "tuners": "Gotoh",
    "colour": "Yellow",
    "fretboard": "Maple",
    "description": "A high-performance guitar with a fast neck.",
    "price": 1700
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