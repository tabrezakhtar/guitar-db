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
    "price": 1500,
    "images": ["https://res.cloudinary.com/dx8d5hlk1/image/upload/v1742943524/epiphone2_ivfdkx.jpg"],
    "thumbnail": "https://res.cloudinary.com/dx8d5hlk1/image/upload/c_thumb,w_200,g_face/v1742943524/epiphone2_ivfdkx.jpg"
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
    "price": 1800,
    "images": ["https://res.cloudinary.com/dx8d5hlk1/image/upload/v1742943524/epiphone2_ivfdkx.jpg"],
    "thumbnail": "https://res.cloudinary.com/dx8d5hlk1/image/upload/c_thumb,w_200,g_face/v1742943524/epiphone2_ivfdkx.jpg"
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
    "price": 1200,
    "images": ["https://res.cloudinary.com/dx8d5hlk1/image/upload/v1742943524/epiphone2_ivfdkx.jpg"],
    "thumbnail": "https://res.cloudinary.com/dx8d5hlk1/image/upload/c_thumb,w_200,g_face/v1742943524/epiphone2_ivfdkx.jpg"
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
    "price": 1400,
    "images": ["https://res.cloudinary.com/dx8d5hlk1/image/upload/v1742943524/epiphone2_ivfdkx.jpg"],
    "thumbnail": "https://res.cloudinary.com/dx8d5hlk1/image/upload/c_thumb,w_200,g_face/v1742943524/epiphone2_ivfdkx.jpg"
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
    "price": 2000,
    "images": ["https://res.cloudinary.com/dx8d5hlk1/image/upload/v1742943524/epiphone2_ivfdkx.jpg"],
    "thumbnail": "https://res.cloudinary.com/dx8d5hlk1/image/upload/c_thumb,w_200,g_face/v1742943524/epiphone2_ivfdkx.jpg"
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
    "price": 1100,
    "images": ["https://res.cloudinary.com/dx8d5hlk1/image/upload/v1742943524/epiphone2_ivfdkx.jpg"],
    "thumbnail": "https://res.cloudinary.com/dx8d5hlk1/image/upload/c_thumb,w_200,g_face/v1742943524/epiphone2_ivfdkx.jpg"
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
    "price": 1500,
    "images": ["https://res.cloudinary.com/dx8d5hlk1/image/upload/v1742943524/epiphone2_ivfdkx.jpg"],
    "thumbnail": "https://res.cloudinary.com/dx8d5hlk1/image/upload/c_thumb,w_200,g_face/v1742943524/epiphone2_ivfdkx.jpg"
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
    "price": 1300,
    "images": ["https://res.cloudinary.com/dx8d5hlk1/image/upload/v1742943524/epiphone2_ivfdkx.jpg"],
    "thumbnail": "https://res.cloudinary.com/dx8d5hlk1/image/upload/c_thumb,w_200,g_face/v1742943524/epiphone2_ivfdkx.jpg"
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
    "price": 1000,
    "images": ["https://res.cloudinary.com/dx8d5hlk1/image/upload/v1742943524/epiphone2_ivfdkx.jpg"],
    "thumbnail": "https://res.cloudinary.com/dx8d5hlk1/image/upload/c_thumb,w_200,g_face/v1742943524/epiphone2_ivfdkx.jpg"
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
    "price": 1900,
    "images": ["https://res.cloudinary.com/dx8d5hlk1/image/upload/v1742943524/epiphone2_ivfdkx.jpg"],
    "thumbnail": "https://res.cloudinary.com/dx8d5hlk1/image/upload/c_thumb,w_200,g_face/v1742943524/epiphone2_ivfdkx.jpg"
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