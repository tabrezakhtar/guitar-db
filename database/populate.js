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
    "detailedDescription": "The Fender American Professional II Stratocaster features a timeless design with a modern twist. Its single-coil pickups deliver crisp tones, while the 2-point synchronized tremolo ensures smooth playability. With 22 frets and a maple fretboard, this guitar is perfect for professionals seeking versatility and reliability across various genres.",
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
    "detailedDescription": "The Fender American Ultra Telecaster combines sleek design with cutting-edge features. Its noiseless single-coil pickups and deluxe tuners provide exceptional performance. Ideal for professionals, this guitar is tailored for players who demand precision and versatility in their sound.",
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
    "detailedDescription": "The Fender Player Jaguar offers a bold design with humbucking pickups for a rich, powerful tone. Its floating tremolo system and shorter scale length make it ideal for experimental players and intermediate musicians looking to explore new sounds.",
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
    "detailedDescription": "The Fender American Performer Mustang is a compact guitar with a dynamic vibrato system and classic gear tuners. Its short scale and unique tonal characteristics make it a great choice for indie and alternative players, as well as students and beginners seeking a lightweight, easy-to-play instrument.",
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
    "detailedDescription": "The Fender American Original Jazzmaster pays homage to the vintage models of the 1960s. With its floating tremolo system, vintage-style pickups, and smooth rosewood fretboard, this guitar is perfect for professionals and enthusiasts who appreciate classic tones and retro aesthetics.",
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
    "detailedDescription": "The Fender Player Stratocaster is a reliable and affordable option for players of all levels. Its classic design, smooth playability, and versatile tonal range make it a staple for beginners and intermediate players looking for a high-quality instrument.",
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
    "detailedDescription": "The Fender American Professional II Telecaster offers a blend of modern performance and classic aesthetics. Its single-coil pickups deliver crisp tones, while the comfortable neck ensures effortless playability. This guitar is ideal for professionals and advanced players seeking a versatile instrument.",
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
    "detailedDescription": "The Fender American Performer Jaguar features humbucking pickups and a floating tremolo system for a wide range of tones. Its sleek rosewood fretboard and modern design make it suitable for intermediate and professional players who value versatility and style.",
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
    "detailedDescription": "The Fender Player Mustang is a compact and affordable guitar with a dynamic vibrato system. Its short scale and unique tonal options make it a great choice for beginners and students looking for a lightweight, easy-to-play instrument.",
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
    "detailedDescription": "The Fender American Ultra Jazzmaster is a high-performance guitar with advanced features. Its noiseless pickups, floating tremolo system, and sleek design make it a top choice for professionals and modern players seeking cutting-edge performance and style.",
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